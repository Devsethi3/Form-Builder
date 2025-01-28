"use client";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { Separator } from "@/components/ui/separator";
import CreateFormBtn from "@/components/CreateFormBtn";
import { GetFormStats, GetForms } from "@/action/form";
import FormCard from "@/components/FormCard";
import { Form } from "@prisma/client";

export default function Home() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof GetFormStats>> | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, formsData] = await Promise.all([
          GetFormStats(),
          GetForms(),
        ]);
        setStats(statsData);
        setForms(formsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFormDeleted = (formId: number) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
    // Update stats
    setStats((prevStats) => {
      if (!prevStats) return null;
      return {
        ...prevStats,
        visits: prevStats.visits - (forms.find(f => f.id === formId)?.visits || 0),
        submissions: prevStats.submissions - (forms.find(f => f.id === formId)?.submissions || 0),
      };
    });
  };

  return (
    <div className="container pt-4">
      <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total visits"
          icon={<LuView className="text-blue-600" />}
          helperText="All time form visits"
          value={stats?.visits.toLocaleString() || "0"}
          loading={loading}
          className="shadow-md shadow-blue-600"
        />

        <StatsCard
          title="Total submissions"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="All time form submissions"
          value={stats?.submissions.toLocaleString() || "0"}
          loading={loading}
          className="shadow-md shadow-yellow-600"
        />

        <StatsCard
          title="Submission rate"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="Visits that result in form submission"
          value={stats?.submissionRate.toLocaleString() + "%" || "0%"}
          loading={loading}
          className="shadow-md shadow-green-600"
        />

        <StatsCard
          title="Bounce rate"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="Visits that leave without interacting"
          value={stats?.bounceRate.toLocaleString() + "%" || "0%"}
          loading={loading}
          className="shadow-md shadow-red-600"
        />
      </div>

      <Separator className="my-6" />
      <h2 className="text-3xl lg:text-4xl font-bold col-span-2">Your forms</h2>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CreateFormBtn />
        {loading ? (
          [1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))
        ) : (
          forms.map((form) => (
            <FormCard key={form.id} form={form} onDelete={handleFormDeleted} />
          ))
        )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  helperText: string;
  className: string;
  loading: boolean;
  icon: ReactNode;
}

function FormCardSkeleton() {
  return <Skeleton className="h-[190px] w-full" />;
}
