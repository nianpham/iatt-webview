import { IMAGES } from '@/utils/image';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const CircularProgressBar = ({
    value = 0,
    maxValue = 100,
    size = 156,
    strokeWidth = 10,
    circleColor = '#d6d6d6',
    progressColor = '#3949AB',
    textColor = '#000000',
    showPercentage = true,
    animationDuration = 1000
}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const targetPercentage = (value / maxValue) * 100;

        const timer = setTimeout(() => {
            setProgress(targetPercentage);
        }, 100);

        return () => clearTimeout(timer);
    }, [value, maxValue]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const center = size / 2;

    return (
        <div className="relative inline-flex justify-center items-center">
            <svg
                className="transform -rotate-90"
                width={size}
                height={size}
            >
                <circle
                    className="transition-all duration-300 ease-in-out"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={circleColor}
                    fill="transparent"
                />

                <circle
                    className={`transition-all ease-in-out`}
                    style={{ transitionDuration: `${animationDuration}ms` }}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={progressColor}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>

            {showPercentage && (
                <div
                    className="absolute inset-0 flex items-center justify-center font-semibold"
                    style={{ color: textColor }}
                >
                    {/* {Math.round(progress)}% */}
                    <Image
                        src={IMAGES.LOGO}
                        alt=""
                        width={1000}
                        height={1000}
                        className="w-24 h-24"
                    />
                </div>
            )}
        </div>
    );
};

export default CircularProgressBar;