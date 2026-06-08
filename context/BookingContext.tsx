'use client';

/**
 * BookingContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Global state for the slide-out booking drawer.
 * Manages open/close state, selected service, and multi-step form progress.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type BookingStep = 'service' | 'practitioner' | 'datetime' | 'details' | 'confirm';

export interface BookingService {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  category: string;
}

export interface BookingPractitioner {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  avatar: string;
}

export interface BookingSlot {
  date: string; // ISO date string
  time: string;
  practitionerId: string;
}

export interface BookingFormData {
  service: BookingService | null;
  practitioner: BookingPractitioner | null;
  slot: BookingSlot | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

interface BookingContextValue {
  isOpen: boolean;
  currentStep: BookingStep;
  formData: BookingFormData;
  open: (preselectedService?: BookingService) => void;
  close: () => void;
  setStep: (step: BookingStep) => void;
  updateFormData: (updates: Partial<BookingFormData>) => void;
  reset: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const defaultFormData: BookingFormData = {
  service: null,
  practitioner: null,
  slot: null,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  notes: '',
};

// ─── Context ───────────────────────────────────────────────────────────────────
const BookingContext = createContext<BookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [formData, setFormData] = useState<BookingFormData>(defaultFormData);

  const open = useCallback((preselectedService?: BookingService) => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, service: preselectedService }));
      setCurrentStep('practitioner');
    } else {
      setCurrentStep('service');
    }
    setIsOpen(true);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setFormData(defaultFormData);
    setCurrentStep('service');
  }, []);

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        currentStep,
        formData,
        open,
        close,
        setStep: setCurrentStep,
        updateFormData,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
