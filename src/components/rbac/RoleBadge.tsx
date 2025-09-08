import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '../../../types/rbac';
import { Shield, Crown, Star, Gem, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig = {
  user: {
    label: 'Utilisateur',
    icon: User,
    variant: 'secondary' as const,
    color: 'text-gray-500',
  },
  premium: {
    label: 'Premium',
    icon: Gem,
    variant: 'default' as const,
    color: 'text-purple-500',
  },
  moderator: {
    label: 'Modérateur',
    icon: Shield,
    variant: 'outline' as const,
    color: 'text-blue-500',
  },
  admin: {
    label: 'Administrateur',
    icon: Star,
    variant: 'destructive' as const,
    color: 'text-red-500',
  },
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    variant: 'default' as const,
    color: 'text-yellow-500',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
      {config.label}
    </Badge>
  );
};
