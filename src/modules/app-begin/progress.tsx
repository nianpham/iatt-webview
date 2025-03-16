"use client"

import * as React from "react"

import { Progress } from "@/components/ui/progress"

export function CustomProgress() {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(100), 500)
        return () => clearTimeout(timer)
    }, [])

    return <Progress value={progress} className="w-[60%]" />
}
