import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

  const getRecipientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'polish_employer': 'Polski pracodawca',
      'zus': 'ZUS (własna działalność)',
      'foreign_employer': 'Zagraniczny pracodawca',
      'uniformed': 'Służby mundurowe',
      'care_allowance': 'Zasiłek opiekuńczy'
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
                <span className="font-medium">{formData.datyChoroby?.illness_start || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data zakończenia:</span>
                <span className="font-medium">{formData.datyChoroby?.illness_end || '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typ zwolnienia</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-medium">
                {formData.rodzajZwolnienia?.recipient_type 
                  ? getRecipientTypeLabel(formData.rodzajZwolnienia.recipient_type)
                  : '-'}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wywiad medyczny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.wywiadObjawy?.main_category && (
                <div>
                  <span className="text-muted-foreground">Kategoria: </span>
                  <span className="font-medium">{getMainCategoryLabel(formData.wywiadObjawy.main_category)}</span>
                </div>
              )}
              {formData.wywiadObjawy?.free_text_reason && (
                <div>
                  <span className="text-muted-foreground">Powód: </span>
                  <span className="font-medium">{formData.wywiadObjawy.free_text_reason}</span>
                </div>
              )}
              {formData.wywiadOgolny?.q_chronic === 'yes' && formData.wywiadOgolny?.chronic_list?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Choroby przewlekłe: </span>
                  <span className="font-medium">Tak</span>
                </div>
              )}
              {formData.wywiadOgolny?.q_meds === 'yes' && (
                <div>
                  <span className="text-muted-foreground">Przyjmowane leki: </span>
                  <span className="font-medium">{formData.wywiadOgolny.meds_list}</span>
                </div>
              )}
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