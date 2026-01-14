import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, RefreshCw, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

interface CaseStatusData {
  case_number: string;
  status: string;
  payment_status: string;
  illness_start: string;
  illness_end: string;
  created_at: string;
  updated_at: string;
}

interface Med24VisitStatus {
  id: string;
  is_resolved: boolean;
  is_cancelled: boolean;
  is_booking_finalized: boolean;
  documentation_download_url?: string | null;
}

export default function StatusSprawy() {
  const [caseNumber, setCaseNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMed24, setIsFetchingMed24] = useState(false);
  const [caseData, setCaseData] = useState<CaseStatusData | null>(null);
  const [med24Status, setMed24Status] = useState<Med24VisitStatus | null>(null);
  
  const { t, i18n } = useTranslation("status");
  const { getLocalizedPath, currentLanguage } = useLanguageNavigation();
  
  const dateLocale = currentLanguage === 'en' ? enUS : pl;

  const handleSearch = async () => {
    if (!caseNumber.trim()) {
      toast.error(t("status.errors.enterVisitNumber"));
      return;
    }

    // Validate case number format
    const caseNumberPattern = /^EZ-[A-Z0-9]{9}$/i;
    if (!caseNumberPattern.test(caseNumber.trim())) {
      toast.error(t("status.errors.invalidFormat"));
      return;
    }

    setIsSearching(true);
    setMed24Status(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-case-status', {
        body: { case_number: caseNumber.trim().toUpperCase() }
      });

      if (error) {
        console.error('Search error:', error);
        toast.error(t("status.errors.searchError"));
        setCaseData(null);
        return;
      }
      
      if (data?.error) {
        toast.error(data.error);
        setCaseData(null);
        return;
      }

      if (!data?.case) {
        toast.error(t("status.errors.notFound"));
        setCaseData(null);
        return;
      }

      setCaseData(data.case);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(t("status.errors.searchError"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (caseData) {
      await handleSearch();
      toast.success(t("status.statusUpdated"));
    }
  };

  const getUnifiedStatus = () => {
    if (!caseData) return null;

    if (caseData.status === 'rejected') {
      return {
        label: t("status.states.rejected.label"),
        description: t("status.states.rejected.description"),
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }

    if (caseData.status === 'completed') {
      return {
        label: t("status.states.completed.label"),
        description: t("status.states.completed.description"),
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    }

    if (caseData.payment_status === 'fail') {
      return {
        label: t("status.states.paymentFailed.label"),
        description: t("status.states.paymentFailed.description"),
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }

    if (caseData.payment_status === 'pending') {
      return {
        label: t("status.states.paymentPending.label"),
        description: t("status.states.paymentPending.description"),
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    }

    return {
      label: t("status.states.inProgress.label"),
      description: t("status.states.inProgress.description"),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
  };

  const status = getUnifiedStatus();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to={getLocalizedPath("/")} className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("status.backToHome")}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("status.title")}</h1>
          <p className="text-muted-foreground">{t("status.subtitle")}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("status.searchTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={t("status.searchPlaceholder")}
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? t("status.searching") : t("status.search")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {caseData && status && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("status.visitInfo")}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {t("status.refresh")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 sm:p-6 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className={status.color}>
                        <status.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <p className={`text-xl sm:text-2xl font-bold ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-lg font-mono font-bold text-muted-foreground break-all mb-2">
                        {caseData.case_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status.details.startDate")}</p>
                    <p className="font-medium">{format(new Date(caseData.illness_start), 'dd.MM.yyyy', { locale: dateLocale })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status.details.endDate")}</p>
                    <p className="font-medium">{format(new Date(caseData.illness_end), 'dd.MM.yyyy', { locale: dateLocale })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status.details.submissionDate")}</p>
                    <p className="font-medium">{format(new Date(caseData.created_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status.details.lastUpdate")}</p>
                    <p className="font-medium">{format(new Date(caseData.updated_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
