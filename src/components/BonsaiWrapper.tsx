'use client';

import React from 'react';
import { DemoBonsaiBubble } from '@/components/DemoBonsaiBubble';

interface BonsaiWrapperProps {
  className?: string;
}

export function BonsaiWrapper({ className }: BonsaiWrapperProps) {
  return <DemoBonsaiBubble className={className} />;
}