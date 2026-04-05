"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface UserReport {
  id: string;
  reportType: "1-year" | "3-year" | "5-year";
  years: number[];
  createdAt: string;
  name: string;
  birthDate?: string;
  preview: {
    duration: string;
    years: number[];
    firstYearTheme: string;
  };
}

export default function MyReportsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchReports();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports/user");
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "1-year":
        return "1 Year Prediction";
      case "3-year":
        return "3 Year Prediction";
      case "5-year":
        return "5 Year Prediction";
      default:
        return type;
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case "1-year":
        return "from-blue-500 to-cyan-500";
      case "3-year":
        return "from-purple-500 to-pink-500";
      case "5-year":
        return "from-orange-500 to-red-500";
      default:
        return "from-primary to-orange-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="text-muted-foreground mt-4">Loading your reports...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">
                lock
              </span>
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your astrology reports
              </p>
              <Link href="/sign-in">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-6xl text-primary">
              description
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            My Astrology Reports
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View and manage all your personalized astrology prediction reports
          </p>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {reports.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                  folder_open
                </span>
                <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t generated any astrology reports yet. Start by creating your first prediction report!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/reports/1-year-prediction">
                    <Button variant="outline">1 Year Report</Button>
                  </Link>
                  <Link href="/reports/3-year-prediction">
                    <Button variant="outline">3 Year Report</Button>
                  </Link>
                  <Link href="/reports/5-year-prediction">
                    <Button variant="outline">5 Year Report</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 group"
                >
                  <CardContent className="p-6">
                    {/* Report Type Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        className={`bg-gradient-to-r ${getReportColor(report.reportType)} text-white border-0`}
                      >
                        {getReportTypeLabel(report.reportType)}
                      </Badge>
                      <span className="material-symbols-outlined text-primary">
                        auto_awesome
                      </span>
                    </div>

                    {/* Report Name */}
                    <h3 className="text-xl font-serif font-bold mb-2 line-clamp-1">
                      {report.name}
                    </h3>

                    {/* Birth Date */}
                    {report.birthDate && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="material-symbols-outlined text-xs align-middle mr-1">
                          calendar_today
                        </span>
                        Born: {report.birthDate}
                      </p>
                    )}

                    {/* Years Covered */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-1">Years Covered:</p>
                      <p className="text-sm text-muted-foreground">
                        {report.years.join(", ")}
                      </p>
                    </div>

                    {/* Theme Preview */}
                    {report.preview.firstYearTheme && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic">
                        &quot;{report.preview.firstYearTheme}&quot;
                      </p>
                    )}

                    {/* Created Date */}
                    <p className="text-xs text-muted-foreground mb-4">
                      Created: {formatDate(report.createdAt)}
                    </p>

                    {/* View Button */}
                    <Link href={`/reports/${report.reportType}-prediction?reportId=${report.id}`}>
                      <Button className="w-full gap-2 group-hover:bg-primary/90">
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        View Report
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Generate New Report CTA */}
          {reports.length > 0 && (
            <Card className="mt-8 bg-gradient-to-r from-primary/5 to-orange-500/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Need Another Report?</h3>
                <p className="text-muted-foreground mb-6">
                  Generate a new prediction report with different birth details or duration
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/reports/1-year-prediction">
                    <Button variant="outline" className="gap-2">
                      <span className="material-symbols-outlined">add</span>
                      1 Year Report
                    </Button>
                  </Link>
                  <Link href="/reports/3-year-prediction">
                    <Button variant="outline" className="gap-2">
                      <span className="material-symbols-outlined">add</span>
                      3 Year Report
                    </Button>
                  </Link>
                  <Link href="/reports/5-year-prediction">
                    <Button variant="outline" className="gap-2">
                      <span className="material-symbols-outlined">add</span>
                      5 Year Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
