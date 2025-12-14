"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { ActionState, updatePassword } from "./actions";

const initialState: ActionState = {};

export function PasswordForm() {
  const [state, action, isPending] = useActionState(updatePassword, initialState);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Current Password</label>
        <div className="relative">
          <Input
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">New Password</label>
        <div className="relative">
          <Input
            name="newPassword"
            type={showNew ? "text" : "password"}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500">{state.success}</p>}
      <Button variant="outline" disabled={isPending}>
        {isPending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
