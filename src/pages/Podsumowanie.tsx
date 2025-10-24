import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function Podsumowanie() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      // Pobierz dane profilu z Supabase
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfileData(data);
      } else {
        // Tryb gościa - spróbuj pobrać ostatni profil gościa
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_guest', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setProfileData(data);
      }

      // Pobierz dane z localStorage
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
    const labels: Record<string, string> = {
      'pl_employer': 'Polski pracodawca',
      'uniformed': 'Służby mundurowe',
      'student': 'Student/Uczeń',
      'foreign_employer': 'Pracodawca zagraniczny',
      'care': 'Zwolnienie na opiekę'
    };
    return labels[type] || type;
  };

  const getMainCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'cold_pain': 'Przeziębienie / Ból',
      'digestive': 'Problemy trawienne',
      'injury': 'Uraz',
      'mental': 'Zdrowie psychiczne',
      'pregnancy': 'Ciąża',
      'other': 'Inne'
    };
    return labels[category] || category;
  };

  const getChronicConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'hypertension': 'Nadciśnienie',
      'diabetes': 'Cukrzyca',
      'asthma': 'Astma',
      'heart_disease': 'Choroba serca',
      'thyroid': 'Choroba tarczycy',
      'autoimmune': 'Choroba autoimmunologiczna',
      'cancer': 'Nowotwór',
      'mental_health': 'Choroba psychiczna',
      'other': 'Inna'
    };
    return labels[condition] || condition;
  };

  const getSymptomLabel = (symptom: string) => {
    const labels: Record<string, string> = {
      'fever': 'Gorączka',
      'chills': 'Dreszcze',
      'cough': 'Kaszel',
      'sore_throat': 'Ból gardła',
      'runny_nose': 'Katar',
      'headache': 'Ból głowy',
      'body_aches': 'Bóle mięśniowe',
      'fatigue': 'Zmęczenie',
      'nausea': 'Nudności',
      'vomiting': 'Wymioty',
      'diarrhea': 'Biegunka',
      'stomach_pain': 'Ból brzucha',
      'dizziness': 'Zawroty głowy',
      'shortness_of_breath': 'Duszność',
      'chest_pain': 'Ból w klatce piersiowej',
      'back_pain': 'Ból pleców',
      'joint_pain': 'Bólstawów',
      'rash': 'Wysypka',
      'swelling': 'Obrzęk',
      'other': 'Inne'
    };
    return labels[symptom] || symptom;
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p>Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={5} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Podsumowanie</h1>
          <p className="text-muted-foreground">Sprawdź poprawność wprowadzonych danych przed przejściem do płatności</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Imię i nazwisko:</span>
                <span className="font-medium">{profileData.first_name} {profileData.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{profileData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PESEL:</span>
                <span className="font-medium">{profileData.pesel}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Okres zwolnienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data rozpoczęcia:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_start 
                    ? format(new Date(formData.datyChoroby.illness_start), 'dd.MM.yyyy', { locale: pl })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data zakończenia:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_end 
                    ? format(new Date(formData.datyChoroby.illness_end), 'dd.MM.yyyy', { locale: pl })
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typ zwolnienia</CardTitle>
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
              <CardTitle>Wywiad medyczny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Wywiad ogólny:</h4>
                
                {formData.wywiadOgolny?.q_pregnant && (
                  <div>
                    <span className="text-muted-foreground">Ciąża: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_pregnant === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_pregnant === 'yes' && formData.wywiadOgolny?.q_preg_leave && (
                  <div>
                    <span className="text-muted-foreground">Zwolnienie związane z ciążą: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_preg_leave === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_chronic && (
                  <div>
                    <span className="text-muted-foreground">Choroby przewlekłe: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_chronic === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_chronic === 'yes' && formData.wywiadOgolny.chronic_list?.length > 0 && (
                      <div className="ml-4 mt-1 text-sm">
                        {formData.wywiadOgolny.chronic_list.map((condition: string) => (
                          <div key={condition}>• {getChronicConditionLabel(condition)}</div>
                        ))}
                        {formData.wywiadOgolny.chronic_other && (
                          <div>• Inne: {formData.wywiadOgolny.chronic_other}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_allergy && (
                  <div>
                    <span className="text-muted-foreground">Alergie: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_allergy === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_allergy === 'yes' && formData.wywiadOgolny.allergy_text && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.allergy_text}</div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_meds && (
                  <div>
                    <span className="text-muted-foreground">Przyjmowane leki: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_meds === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_meds === 'yes' && formData.wywiadOgolny.meds_list && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.meds_list}</div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_long_leave && (
                  <div>
                    <span className="text-muted-foreground">Długotrwałe zwolnienie (powyżej 33 dni w roku): </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_long_leave === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm">Objawy i dolegliwości:</h4>
                
                {formData.wywiadObjawy?.main_category && (
                  <div>
                    <span className="text-muted-foreground">Kategoria: </span>
                    <span className="font-medium">{getMainCategoryLabel(formData.wywiadObjawy.main_category)}</span>
                  </div>
                )}
                
                {formData.wywiadObjawy?.symptom_duration && (
                  <div>
                    <span className="text-muted-foreground">Czas trwania objawów: </span>
                    <span className="font-medium">
                      {formData.wywiadObjawy.symptom_duration === 'today' && 'Od dziś'}
                      {formData.wywiadObjawy.symptom_duration === 'yesterday' && 'Od wczoraj'}
                      {formData.wywiadObjawy.symptom_duration === '2-3_days' && '2-3 dni'}
                      {formData.wywiadObjawy.symptom_duration === 'week' && 'Tydzień'}
                      {formData.wywiadObjawy.symptom_duration === 'longer' && 'Dłużej'}
                    </span>
                  </div>
                )}
                
                {formData.wywiadObjawy?.symptoms && formData.wywiadObjawy.symptoms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Objawy: </span>
                    <div className="ml-4 mt-1 text-sm">
                      {formData.wywiadObjawy.symptoms.map((symptom: string) => (
                        <div key={symptom}>• {getSymptomLabel(symptom)}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.wywiadObjawy?.free_text_reason && (
                  <div>
                    <span className="text-muted-foreground">Opis dolegliwości: </span>
                    <div className="mt-1 text-sm bg-muted/30 p-2 rounded">{formData.wywiadObjawy.free_text_reason}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Koszt usługi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg">E-konsultacja + e-ZLA:</span>
                <span className="text-2xl font-bold text-primary">149 PLN</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Ważne:</strong> Lekarz może skontaktować się z Tobą telefonicznie w celu weryfikacji danych. 
              E-konsultacja nie gwarantuje wystawienia e-ZLA - ostateczną decyzję podejmuje lekarz na podstawie 
              wywiadu medycznego i obowiązujących przepisów.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate("/daty-choroby")} className="flex-1">
              Edytuj dane
            </Button>
            <Button onClick={() => navigate("/platnosc")} className="flex-1">
              Przejdź do płatności
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}