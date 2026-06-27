"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/app/_components/global/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function AspirationButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setLoading(true);
    router.push("/aspirasi");
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      isDisabled={loading}
      className="min-w-[160px]"
    >
      {loading ? (
        <AiOutlineLoading3Quarters className="animate-spin" size={20} />
      ) : (
        "Kirim aspirasi"
      )}
    </Button>
  );
}
