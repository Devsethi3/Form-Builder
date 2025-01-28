"use client"
import { FaEdit, FaWpforms } from "react-icons/fa";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { LuView } from "react-icons/lu";
import { Button } from "./ui/button";
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";
import { formatDistance } from "date-fns";
import { Form } from "@prisma/client";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useTransition } from "react";
import { FaSpinner } from "react-icons/fa";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "./ui/use-toast";
import { DeleteForm } from "@/action/form";
import GenerateCodeBtn from "./GenerateCodeBtn";
import { useState } from "react";

interface FormCardProps {
    form: Form;
    onDelete?: (formId: number) => void;
}

const FormCard = ({ form, onDelete }: FormCardProps) => {
    const [loading, startTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        try {
            startTransition(async () => {
                await DeleteForm(form.id);
                toast({
                    title: "Success",
                    description: "Form deleted successfully",
                });
                setShowDeleteDialog(false);
                onDelete?.(form.id);
            });
        } catch (error) {
            console.error("Error deleting form:", error);
            toast({
                title: "Error",
                description: "Failed to delete form",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                        <FaWpforms className="h-6 w-6 text-gray-500" />
                        {form.name}
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant={form.published ? "default" : "secondary"}>
                            {form.published ? "Published" : "Draft"}
                        </Badge>
                        {form.published && (
                            <Badge variant="secondary" className="flex gap-2">
                                <LuView className="h-4 w-4" />
                                {form.visits}
                            </Badge>
                        )}
                    </div>
                </CardTitle>
                <CardDescription>
                    Created {formatDistance(new Date(form.createdAt), new Date(), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
                {form.description || "No description"}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <div className="flex gap-2">
                    {form.published ? (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={`/submit/${form.shareURL}`} target="_blank">
                                    View
                                </Link>
                            </Button>
                            <GenerateCodeBtn id={form.id} />
                        </>
                    ) : (
                        <Button asChild>
                            <Link href={`/builder/${form.id}`}>
                                Edit form <BiRightArrowAlt className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                </div>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full">
                                <PiDotsThreeOutlineVerticalFill className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <RiDeleteBin5Line className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the form &ldquo;{form.name}&rdquo; and all its submissions.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={loading}
                                onClick={handleDelete}
                            >
                                {loading ? (
                                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    <RiDeleteBin5Line className="mr-2 h-4 w-4" />
                                )}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};

export default FormCard;