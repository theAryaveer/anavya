import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    showStrengthMeter?: boolean;
    label?: string;
}

interface PasswordRequirement {
    text: string;
    met: boolean;
}

export const PasswordInput = ({
    value,
    onChange,
    placeholder = 'Enter password',
    showStrengthMeter = false,
    label = 'Password',
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    // Password strength requirements
    const requirements: PasswordRequirement[] = [
        { text: 'At least 8 characters', met: value.length >= 8 },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(value) },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(value) },
        { text: 'Contains number', met: /[0-9]/.test(value) },
        { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(value) },
    ];

    const metRequirements = requirements.filter((req) => req.met).length;
    const strength = metRequirements <= 2 ? 'weak' : metRequirements <= 4 ? 'medium' : 'strong';

    const strengthColors = {
        weak: 'bg-netflix-red',
        medium: 'bg-netflix-gold',
        strong: 'bg-emerald-500',
    };

    const strengthText = {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={72}
                    className="nx-input pr-12"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* Password Strength Meter */}
            {showStrengthMeter && value.length > 0 && (
                <div className="space-y-2 mt-4">
                    {/* Strength Bar */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div
                                className={`h-full ${strengthColors[strength]} transition-all duration-300`}
                                style={{ width: `${(metRequirements / 5) * 100}%` }}
                            />
                        </div>
                        <span
                            className={`text-xs font-medium ${strength === 'weak' ? 'text-netflix-red' : strength === 'medium' ? 'text-netflix-gold' : 'text-emerald-400'}`}
                        >
                            {strengthText[strength]}
                        </span>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-1 mt-2">
                        {requirements.map((req, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 text-xs transition-colors ${req.met ? 'text-emerald-400' : 'text-white/40'}`}
                            >
                                {req.met ? (
                                    <Check size={14} className="flex-shrink-0" />
                                ) : (
                                    <X size={14} className="flex-shrink-0" />
                                )}
                                <span>{req.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
