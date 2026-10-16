"use client";
import Wrapper from "@/layouts/Wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Wrapper>{children}</Wrapper>
    );
}
