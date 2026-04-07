"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, MoreVertical } from "lucide-react";
import { branchSchema, type BranchInput, type UpdateBranchInput } from "@/modules/onboarding/schema/onboarding.schema";
import {
  createBranchAction,
  updateBranchAction,
  setMainBranchAction,
} from "@/modules/onboarding/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  is_main: boolean;
}

interface StepBranchesProps {
  companyId: string;
  branches: Branch[];
  branchLimit?: number;
  onNext: () => void;
  onPrev: () => void;
}

export function StepBranches({ companyId, branches, branchLimit = 1, onNext, onPrev }: StepBranchesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localBranches, setLocalBranches] = useState<Branch[]>(branches);

  const form = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      companyId,
      name: "",
      address: "",
      phone: "",
      email: "",
      isMain: false,
    },
    mode: "onBlur",
  });

  async function onSubmit(data: BranchInput) {
    setIsLoading(true);
    try {
      if (editingBranch) {
        const formData = new FormData();
        formData.append("branchId", editingBranch.id);
        formData.append("companyId", companyId);
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            formData.append(k, String(v));
          }
        });
        await updateBranchAction(formData);
        toast.success("Branch updated");
      } else {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            formData.append(k, String(v));
          }
        });
        await createBranchAction(formData);
        toast.success("Branch created");
      }
      
      setIsOpen(false);
      form.reset();
      setEditingBranch(null);
      
      // Refresh branches - in a real app, you'd revalidate
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save branch");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetMain(branch: Branch) {
    try {
      await setMainBranchAction(branch.id, companyId);
      toast.success("Main branch updated");
      setLocalBranches((prev) =>
        prev.map((b) => ({
          ...b,
          is_main: b.id === branch.id,
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set main branch");
    }
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch);
    form.reset({
      companyId,
      name: branch.name,
      slug: branch.slug,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      isMain: branch.is_main,
    });
    setIsOpen(true);
  }

  const canAddMore = localBranches.length < branchLimit;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Branches</CardTitle>
        <CardDescription>
          Manage your company branches. You can have up to {branchLimit} branches on your current plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch List */}
        <div className="space-y-2">
          {localBranches.map((branch) => (
            <div
              key={branch.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {branch.is_main ? (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ) : (
                  <div className="h-5 w-5" />
                )}
                <div>
                  <p className="font-medium">{branch.name}</p>
                  {branch.address && (
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!branch.is_main && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetMain(branch)}
                  >
                    Set as Main
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(branch)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {localBranches.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No branches yet. Add your first branch to get started.
            </p>
          )}
        </div>

        {/* Add Branch Button */}
        {canAddMore && (
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingBranch(null);
              form.reset({ companyId, name: "", address: "", phone: "", email: "", isMain: false });
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? "Edit Branch" : "Add Branch"}
                </DialogTitle>
                <DialogDescription>
                  {editingBranch
                    ? "Update the branch details below."
                    : "Add a new branch to your company."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle 123, Bogotá" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+57 300 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="branch@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="isMain"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set as main branch</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : editingBranch ? "Update" : "Add"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {!canAddMore && (
          <p className="text-center text-sm text-muted-foreground">
            You've reached your branch limit. Upgrade your plan to add more branches.
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
