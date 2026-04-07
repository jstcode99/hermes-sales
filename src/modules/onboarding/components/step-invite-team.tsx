"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, UserPlus, X, Users } from "lucide-react";
import { inviteSchema, type InviteInput } from "@/modules/onboarding/schema/onboarding.schema";
import { inviteUserAction, cancelInvitationAction } from "@/modules/onboarding/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface StepInviteTeamProps {
  companyId: string;
  members: TeamMember[];
  invitations: Invitation[];
  userLimit?: number;
  onNext: () => void;
  onPrev: () => void;
}

export function StepInviteTeam({
  companyId,
  members,
  invitations,
  userLimit = 5,
  onNext,
  onPrev,
}: StepInviteTeamProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localInvitations, setLocalInvitations] = useState<Invitation[]>(invitations);

  const form = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      companyId,
      email: "",
      role: "member",
    },
    mode: "onBlur",
  });

  async function onSubmit(data: InviteInput) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });

      await inviteUserAction(formData);
      toast.success("Invitation sent successfully");
      form.reset({ companyId, email: "", role: "member" });
      
      // Add to local state (in real app would revalidate)
      setLocalInvitations((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          email: data.email,
          role: data.role,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelInvite(invitationId: string) {
    try {
      await cancelInvitationAction(invitationId, companyId);
      toast.success("Invitation cancelled");
      setLocalInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "destructive";
      case "seller":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalUsers = members.length + localInvitations.length;
  const canInviteMore = totalUsers < userLimit;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invite Team
        </CardTitle>
        <CardDescription>
          Invite members to your company. You can invite up to {userLimit} users on your current plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Members */}
        <div className="space-y-2">
          <h3 className="font-medium">Current Members</h3>
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {member.user.full_name?.[0] || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {member.user.full_name || "Team Member"}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No members yet</p>
          )}
        </div>

        {/* Pending Invitations */}
        {localInvitations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Pending Invitations</h3>
            <div className="space-y-2">
              {localInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">Role: {invitation.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvite(invitation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Form */}
        {canInviteMore ? (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Send Invitation</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="colleague@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="seller">Seller</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            You've reached your user limit. Upgrade your plan to invite more members.
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
