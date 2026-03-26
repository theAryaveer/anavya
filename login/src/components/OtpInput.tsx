import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}

export const OtpInput = ({ value, onChange, length = 6 }: OtpInputProps) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Initialize refs array
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newValue = e.target.value;
        if (/[^0-9]/.test(newValue)) return; // Only allow numbers

        const otpArray = value.split('');
        otpArray[index] = newValue.slice(-1); // Take only the last character entered

        const newOtp = otpArray.join('');
        onChange(newOtp);

        // Auto focus next input
        if (newValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            const otpArray = value.split('');
            otpArray[index - 1] = '';
            onChange(otpArray.join(''));
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);

        if (pastedData) {
            onChange(pastedData);
            // Focus the last filled input or the first empty one
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-4 my-8" onPaste={handlePaste}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border text-white focus:outline-none transition-all duration-200"
                    style={{
                        background: 'rgba(31,31,31,0.9)',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(229,9,20,0.6)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.12)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            ))}
        </div>
    );
};
