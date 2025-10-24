import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function PanelUzytkownika() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Robocza',
      'submitted': 'Złożona',
      'in_review': 'W trakcie weryfikacji',
      'completed': 'Zakończona',
      'rejected': 'Odrzucona'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'in_review': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (!user) {
      navigate('/logowanie');
      return;
    }

    const fetchData = async () => {
      try {
        // Pobierz profil użytkownika
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setProfile(profileData);

        if (profileData) {
          // Pobierz sprawy użytkownika
          const { data: casesData } = await supabase
            .from('cases')
            .select('*')
            .eq('profile_id', profileData.id)
            .order('created_at', { ascending: false });

          setCases(casesData || []);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel użytkownika</h1>
            {profile && (
              <p className="text-muted-foreground">
                Witaj, {profile.first_name} {profile.last_name}!
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Wyloguj się
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Twoje dane</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PESEL</p>
                  <p className="font-medium">{profile.pesel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adres</p>
                  <p className="font-medium">
                    {profile.street} {profile.house_no}
                    {profile.flat_no && `/${profile.flat_no}`}, {profile.postcode} {profile.city}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Twoje sprawy</CardTitle>
              <Button onClick={() => navigate('/daty-choroby')}>
                Nowe zgłoszenie
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych zgłoszeń</p>
                <Button onClick={() => navigate('/daty-choroby')}>
                  Złóż pierwsze zgłoszenie
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-bold text-lg">{caseItem.case_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Zgłoszono: {format(new Date(caseItem.created_at), 'dd.MM.yyyy HH:mm', { locale: pl })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseItem.status)}`}>
                        {getStatusLabel(caseItem.status)}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Okres zwolnienia: </span>
                        <span className="font-medium">
                          {format(new Date(caseItem.illness_start), 'dd.MM', { locale: pl })} - {format(new Date(caseItem.illness_end), 'dd.MM.yyyy', { locale: pl })}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Powód: </span>
                        <span className="font-medium">{caseItem.free_text_reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
