import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
}

export const OtpInput = ({ length = 6, value, onChange, onComplete }: OtpInputProps) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));

    // Sync internal state with prop value
    useEffect(() => {
        const otpArray = value.split('').slice(0, length);
        while (otpArray.length < length) {
            otpArray.push('');
        }
        setOtp(otpArray);
    }, [value, length]);

    const handleChange = (index: number, digit: string) => {
        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        const otpString = newOtp.join('');
        onChange(otpString);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Trigger onComplete if all digits are filled
        if (otpString.length === length && onComplete) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle left/right arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        const newOtp = [...otp];

        pastedData.split('').forEach((digit, i) => {
            if (i < length) {
                newOtp[i] = digit;
            }
        });

        setOtp(newOtp);
        const otpString = newOtp.join('');
        onChange(otpString);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[length - 1]?.focus();
            if (onComplete) onComplete(otpString);
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold bg-midnight-100/80 border border-slate-700/50 rounded-xl text-slate-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
};
