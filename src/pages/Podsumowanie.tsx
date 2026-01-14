import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

export default function Podsumowanie() {
  const { t, i18n } = useTranslation(['forms']);
  const { navigateToLocalized } = useLanguageNavigation();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setProfileData(data);
      } else {
        // For guests, use localStorage (RLS blocks SELECT for anonymous users)
        const guestProfile = localStorage.getItem('guestProfile');
        if (guestProfile) {
          setProfileData(JSON.parse(guestProfile));
        }
      }

      const datyChoroby = localStorage.getItem('formData_datyChoroby');
      const rodzajZwolnienia = localStorage.getItem('formData_rodzajZwolnienia');
      const wywiadOgolny = localStorage.getItem('formData_wywiadOgolny');
      const wywiadObjawy = localStorage.getItem('formData_wywiadObjawy');

      setFormData({
        datyChoroby: datyChoroby ? JSON.parse(datyChoroby) : {},
        rodzajZwolnienia: rodzajZwolnienia ? JSON.parse(rodzajZwolnienia) : {},
        wywiadOgolny: wywiadOgolny ? JSON.parse(wywiadOgolny) : {},
        wywiadObjawy: wywiadObjawy ? JSON.parse(wywiadObjawy) : {},
      });
    };

    loadData();
  }, [user]);

  const getLeaveTypeLabel = (type: string) => {
    return t(`forms:leaveType.types.${type}`, type);
  };

  const getMainCategoryLabel = (category: string) => {
    return t(`forms:symptoms.categories.${category}`, category);
  };

  const getChronicConditionLabel = (condition: string) => {
    return t(`forms:generalInterview.chronicDiseases.diseases.${condition}`, condition);
  };

  const getSymptomLabel = (symptom: string) => {
    return t(`forms:symptoms.symptomLabels.${symptom}`, symptom);
  };

  const getDurationLabel = (duration: string) => {
    return t(`forms:symptoms.durations.${duration}`, duration);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p>{t('forms:common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={5} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('forms:summary.title')}</h1>
          <p className="text-muted-foreground">{t('forms:summary.subtitle')}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('forms:summary.personalData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('forms:summary.fullName')}:</span>
                <span className="font-medium">{profileData.first_name} {profileData.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('forms:summary.email')}:</span>
                <span className="font-medium">{profileData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('forms:summary.pesel')}:</span>
                <span className="font-medium">{profileData.pesel}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('forms:summary.leavePeriod')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('forms:summary.startDate')}:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_start 
                    ? format(new Date(formData.datyChoroby.illness_start), 'dd.MM.yyyy', { locale: dateLocale })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('forms:summary.endDate')}:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_end 
                    ? format(new Date(formData.datyChoroby.illness_end), 'dd.MM.yyyy', { locale: dateLocale })
                    : '-'}
                </span>
              </div>
              {formData.datyChoroby?.late_justification && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('forms:summary.justification')}:</span>
                  <span className="font-medium text-right max-w-[60%]">{formData.datyChoroby.late_justification}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('forms:summary.leaveType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-medium">
                {formData.rodzajZwolnienia?.leave_type 
                  ? getLeaveTypeLabel(formData.rodzajZwolnienia.leave_type)
                  : '-'}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('forms:summary.medicalInterview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t('forms:summary.generalInterview')}:</h4>
                
                {formData.wywiadOgolny?.q_pregnant && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.pregnancy')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_pregnant === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_pregnant === 'yes' && formData.wywiadOgolny?.q_preg_leave && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.pregnancyLeave')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_preg_leave === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_chronic && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.chronicDiseases')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_chronic === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                    {formData.wywiadOgolny.q_chronic === 'yes' && formData.wywiadOgolny.chronic_list?.length > 0 && (
                      <div className="ml-4 mt-1 text-sm">
                        {formData.wywiadOgolny.chronic_list.map((condition: string) => (
                          condition === 'other' && formData.wywiadOgolny.chronic_other_text 
                            ? <div key={condition}>• {t('forms:generalInterview.chronicDiseases.diseases.other')}: {formData.wywiadOgolny.chronic_other_text}</div>
                            : <div key={condition}>• {getChronicConditionLabel(condition)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_allergy && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.allergies')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_allergy === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                    {formData.wywiadOgolny.q_allergy === 'yes' && formData.wywiadOgolny.allergy_text && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.allergy_text}</div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_meds && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.medications')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_meds === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                    {formData.wywiadOgolny.q_meds === 'yes' && formData.wywiadOgolny.meds_list && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.meds_list}</div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_long_leave && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.longLeave')}: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_long_leave === 'yes' ? t('forms:common.yes') : t('forms:common.no')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm">{t('forms:summary.symptoms')}:</h4>
                
                {formData.wywiadObjawy?.main_category && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.category')}: </span>
                    <span className="font-medium">{getMainCategoryLabel(formData.wywiadObjawy.main_category)}</span>
                  </div>
                )}
                
                {formData.wywiadObjawy?.symptom_duration && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.symptomDuration')}: </span>
                    <span className="font-medium">
                      {getDurationLabel(formData.wywiadObjawy.symptom_duration)}
                    </span>
                  </div>
                )}
                
                {formData.wywiadObjawy?.symptoms && formData.wywiadObjawy.symptoms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.symptomsList')}: </span>
                    <div className="ml-4 mt-1 text-sm">
                      {formData.wywiadObjawy.symptoms.map((symptom: string) => (
                        <div key={symptom}>• {getSymptomLabel(symptom)}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.wywiadObjawy?.free_text_reason && (
                  <div>
                    <span className="text-muted-foreground">{t('forms:summary.description')}: </span>
                    <div className="mt-1 text-sm bg-muted/30 p-2 rounded">{formData.wywiadObjawy.free_text_reason}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>{t('forms:summary.serviceCost')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg">{t('forms:summary.eConsultation')}:</span>
                <span className="text-2xl font-bold text-primary">79 PLN</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{i18n.language === 'pl' ? 'Ważne' : 'Important'}:</strong> {t('forms:summary.importantNote')}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => navigateToLocalized('/daty-choroby')} className="flex-1">
              {t('forms:summary.editData')}
            </Button>
            <Button onClick={() => navigateToLocalized('/platnosc')} className="flex-1">
              {t('forms:summary.goToPayment')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}