import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Claim, ClaimDocument } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { MailerService } from '../auth/services/mailer.service';

@Injectable()
export class ClaimsService {
  private readonly ALLOWED_CLAIM_STATUS_TRANSITIONS: Record<
    string,
    Set<string>
  > = {
    pending: new Set(['pending', 'processing', 'paid', 'rejected']),
    processing: new Set(['processing', 'paid', 'rejected']),
    paid: new Set(['paid']),
    rejected: new Set(['rejected']),
  };

  private readonly VALID_MILESTONES: Record<number, number> = {
    10: 15,
    25: 30,
    50: 60,
    100: 120,
  };

  constructor(
    @InjectModel(Claim.name) private readonly claimModel: Model<ClaimDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  private isValidClaimStatusTransition(
    fromStatus: string,
    toStatus: string,
  ): boolean {
    const allowedNext = this.ALLOWED_CLAIM_STATUS_TRANSITIONS[fromStatus];
    return Boolean(allowedNext && allowedNext.has(toStatus));
  }

  private applyClaimStatusEffects(
    previousStatus: string,
    nextStatus: string,
    claim: ClaimDocument,
    user: UserDocument,
  ) {
    if (previousStatus === nextStatus) return;

    if (previousStatus !== 'paid' && nextStatus === 'paid') {
      user.totalEarnings += claim.amount;
    } else if (previousStatus === 'paid' && nextStatus !== 'paid') {
      user.totalEarnings = Math.max(0, user.totalEarnings - claim.amount);
    }

    if (previousStatus !== 'rejected' && nextStatus === 'rejected') {
      user.points += claim.points;
      if (user.claimedMilestones) {
        user.claimedMilestones = user.claimedMilestones.filter(
          (m) => m !== claim.points,
        );
      }
    } else if (previousStatus === 'rejected' && nextStatus !== 'rejected') {
      user.points = Math.max(0, user.points - claim.points);
      if (!user.claimedMilestones) user.claimedMilestones = [];
      if (!user.claimedMilestones.includes(claim.points)) {
        user.claimedMilestones.push(claim.points);
      }
    }
  }

  async createClaim(createClaimDto: CreateClaimDto, userId: string) {
    const { points, paymentMethod, paymentDetails } = createClaimDto;

    if (!this.VALID_MILESTONES[points]) {
      throw new BadRequestException(
        'Invalid milestone. Valid milestones are 10, 25, 50, and 100 points.',
      );
    }

    // Check for existing pending claims first
    const pendingClaim = await this.claimModel
      .findOne({
        user: new Types.ObjectId(userId),
        status: 'pending',
      })
      .exec();

    if (pendingClaim) {
      throw new BadRequestException(
        'You already have a pending claim. Please wait for it to be processed.',
      );
    }

    // Atomically decrement points and push milestone to prevent double-submit race conditions
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(userId),
          points: { $gte: points },
          claimedMilestones: { $ne: points },
        },
        {
          $inc: { points: -points },
          $push: { claimedMilestones: points },
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new BadRequestException(
        'Insufficient points or milestone already claimed.',
      );
    }

    // Create claim document
    let claim: ClaimDocument;
    try {
      claim = await this.claimModel.create({
        user: new Types.ObjectId(userId),
        points,
        amount: this.VALID_MILESTONES[points],
        paymentMethod,
        paymentDetails,
      });
    } catch (saveError) {
      // Rollback the atomic points deduction if writing the claim fails
      await this.userModel
        .updateOne(
          { _id: new Types.ObjectId(userId) },
          {
            $inc: { points: points },
            $pull: { claimedMilestones: points },
          },
        )
        .exec();
      throw saveError;
    }

    const populatedClaim = await this.claimModel
      .findById(claim._id)
      .populate('user', 'name email avatar')
      .exec();

    // Send claim submitted email
    if (updatedUser && updatedUser.email) {
      await this.mailerService.sendClaimSubmittedEmail(
        updatedUser.email,
        updatedUser.name,
        claim.points,
        claim.amount,
        claim.paymentMethod,
        claim.paymentDetails,
      );
    }

    return {
      success: true,
      message: 'Claim request submitted successfully!',
      data: populatedClaim,
    };
  }

  async getMyClaims(userId: string) {
    const claims = await this.claimModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('processedBy', 'name')
      .exec();

    return {
      success: true,
      count: claims.length,
      data: claims,
    };
  }

  async getAllClaims(queryParams: any) {
    const { status, page = 1, limit = 20 } = queryParams;

    const query: any = {};
    if (status) query.status = status;

    const lim = Number.parseInt(limit, 10) || 20;
    const pg = Number.parseInt(page, 10) || 1;

    const claims = await this.claimModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .populate('user', 'name email role points avatar')
      .populate('processedBy', 'name')
      .exec();

    const total = await this.claimModel.countDocuments(query).exec();

    return {
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      data: claims,
    };
  }

  async getPendingClaimsCount() {
    const count = await this.claimModel
      .countDocuments({ status: 'pending' })
      .exec();
    return {
      success: true,
      data: { count },
    };
  }

  async updateClaim(id: string, updateClaimDto: UpdateClaimDto, adminId: string) {
    const { status, transactionId, notes } = updateClaimDto;

    const session = await this.claimModel.db.startSession();
    session.startTransaction();

    try {
      const claim = await this.claimModel
        .findById(id)
        .populate('user', 'name email points totalEarnings avatar')
        .session(session)
        .exec();

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      const previousStatus = claim.status;
      const nextStatus = status || claim.status;

      if (!this.isValidClaimStatusTransition(previousStatus, nextStatus)) {
        throw new BadRequestException(`Invalid claim status transition: ${previousStatus} -> ${nextStatus}`);
      }

      // Update claim fields
      claim.status = nextStatus;
      if (transactionId !== undefined) claim.transactionId = transactionId;
      if (notes !== undefined) claim.notes = notes;
      claim.processedBy = new Types.ObjectId(adminId);
      claim.processedAt = new Date();

      await claim.save({ session });

      // Apply side effects on transition
      if (previousStatus !== nextStatus) {
        const user = await this.userModel.findById(claim.user._id).session(session).exec();
        if (user) {
          this.applyClaimStatusEffects(previousStatus, nextStatus, claim, user);
          await user.save({ session });
        }
      }

      await session.commitTransaction();

      const populatedClaim = await this.claimModel
        .findById(claim._id)
        .populate('user', 'name email points totalEarnings avatar')
        .populate('processedBy', 'name')
        .exec();

      // Send payment released email if status is transitioned to paid
      if (previousStatus !== 'paid' && nextStatus === 'paid' && populatedClaim && populatedClaim.user) {
        await this.mailerService.sendPaymentReleasedEmail(
          (populatedClaim.user as any).email,
          (populatedClaim.user as any).name,
          populatedClaim.points,
          populatedClaim.amount,
          populatedClaim.transactionId,
        );
      }

      // Send claim rejected email if status is transitioned to rejected
      if (previousStatus !== 'rejected' && nextStatus === 'rejected' && populatedClaim && populatedClaim.user) {
        await this.mailerService.sendClaimRejectedEmail(
          (populatedClaim.user as any).email,
          (populatedClaim.user as any).name,
          populatedClaim.points,
          populatedClaim.amount,
          populatedClaim.notes || 'Not specified',
        );
      }

      return {
        success: true,
        message: `Claim ${nextStatus} successfully`,
        data: populatedClaim,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getClaimStats() {
    const stats = await this.claimModel
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const formattedStats: Record<
      string,
      { count: number; totalAmount: number }
    > = {
      pending: { count: 0, totalAmount: 0 },
      processing: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
    };

    for (const stat of stats) {
      formattedStats[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
      };
    }

    return {
      success: true,
      data: formattedStats,
    };
  }
}
