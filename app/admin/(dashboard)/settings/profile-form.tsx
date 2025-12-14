"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { ActionState, updateProfile } from "./actions";

const initialState: ActionState = {};

export function ProfileForm({ user }: { user: { name: string | null; email: string } }) {
  const [state, action, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <Input name="name" defaultValue={user.name || ""} required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Email</label>
        <Input name="email" type="email" defaultValue={user.email} required />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500">{state.success}</p>}
      <Button disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
    </form>
  );
}
