'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@heroui/react';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  shape?: 'circle' | 'rounded' | 'rounded-lg' | 'rounded-2xl';
}

const UserAvatar = ({ 
  avatar, 
  name = '', 
  size = 'md', 
  className = '',
  shape = 'circle',
}: UserAvatarProps) => {
  // Map size prop
  const heroUISizes: Record<string, "sm" | "md" | "lg"> = {
    xs: "sm",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "lg",
    "2xl": "lg",
  };
  const sizeValue = heroUISizes[size] || "md";

  // Map shape prop to Tailwind border radius class
  const radiusClasses: Record<string, string> = {
    circle: "rounded-full",
    rounded: "rounded-md",
    "rounded-lg": "rounded-xl",
    "rounded-2xl": "rounded-2xl",
  };
  const radiusClass = radiusClasses[shape] || "rounded-full";

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '?';
  };

  return (
    <Avatar 
      size={sizeValue}
      className={`${radiusClass} overflow-hidden ${className}`}
    >
      {avatar && avatar.trim() !== '' ? (
        <AvatarImage src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : null}
      <AvatarFallback className="flex items-center justify-center font-bold text-sm bg-blue-600 text-white w-full h-full">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
