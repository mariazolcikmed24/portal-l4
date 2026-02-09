import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Baby, User } from "lucide-react";

export default function Podsumowanie() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Check if this is child care leave or family care leave
  const isChildCare = formData.rodzajZwolnienia?.leave_type === 'care';
  const isFamilyCare = formData.rodzajZwolnienia?.leave_type === 'care_family';
  const isCareLeave = isChildCare || isFamilyCare;
  
  // Get patient name based on care type
  const patientName = isChildCare 
    ? formData.rodzajZwolnienia?.care_first_name || 'dziecka'
    : isFamilyCare 
      ? formData.rodzajZwolnienia?.care_family_first_name || 'podopiecznego'
      : '';
  const patientLastName = isChildCare 
    ? formData.rodzajZwolnienia?.care_last_name || ''
    : isFamilyCare 
      ? formData.rodzajZwolnienia?.care_family_last_name || ''
      : '';
  const patientPesel = isChildCare 
    ? formData.rodzajZwolnienia?.care_pesel || ''
    : isFamilyCare 
      ? formData.rodzajZwolnienia?.care_family_pesel || ''
      : '';
  
  // Helper for labels
  const getPatientLabel = () => {
    if (isChildCare) return "dziecka";
    if (isFamilyCare) return "osoby chorej";
    return "";
  };

  useEffect(() => {
    const loadData = async () => {
      // Pobierz dane profilu z Supabase (tylko dla zalogowanych użytkowników)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfileData(data);
      } else {
        // Tryb gościa - pobierz dane z localStorage
        const guestProfile = localStorage.getItem('guestProfileData');
        if (guestProfile) {
          setProfileData(JSON.parse(guestProfile));
        } else {
          // Fallback - utwórz pusty profil
          setProfileData({
            first_name: '',
            last_name: '',
            email: '',
            pesel: ''
          });
        }
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
      'care': 'Zwolnienie na opiekę nad dzieckiem',
      'care_family': 'Opieka nad członkiem rodziny',
      'krus': 'Ubezpieczeni w KRUS'
    };
    return labels[type] || type;
  };

  const getMainCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'cold_pain': 'Przeziębienie lub bóle',
      'gastro': 'Zatrucie i problemy żołądkowe',
      'bladder': 'Problemy z pęcherzem',
      'injury': 'Urazy',
      'menstruation': 'Menstruacja / miesiączka',
      'back_pain': 'Bóle pleców',
      'eye': 'Problemy z oczami',
      'migraine': 'Migrena',
      'acute_stress': 'Ostre reakcje na stres',
      'psych': 'Problemy psychologiczne'
    };
    return labels[category] || category;
  };

  const getChronicConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'autoimmune': 'Choroby autoimmunologiczne',
      'respiratory': 'Choroby układu oddechowego',
      'diabetes': 'Cukrzyca',
      'circulatory': 'Choroby układu krążenia',
      'cancer': 'Nowotwór',
      'osteoporosis': 'Osteoporoza',
      'epilepsy': 'Padaczka',
      'aids': 'AIDS',
      'obesity': 'Otyłość',
      'other': 'Inne'
    };
    return labels[condition] || condition;
  };

  const getSymptomLabel = (symptom: string) => {
    const labels: Record<string, string> = {
      // cold_pain
      'fever': 'Gorączka >38°C',
      'subfebrile': 'Stan podgorączkowy',
      'fatigue': 'Zmęczenie/brak sił',
      'malaise': 'Uczucie "rozbicia"',
      'weakness': 'Osłabienie',
      'chills': 'Dreszcze',
      'muscle_pain': 'Bóle mięśni',
      'joint_pain': 'Bóle stawów',
      'headache': 'Ból głowy',
      'dizziness': 'Zawroty głowy',
      'runny_nose': 'Katar',
      'sneezing': 'Kichanie',
      'stuffy_nose': 'Zatkany nos',
      'sinus_pain': 'Ból zatok',
      'sinus_pressure': 'Ucisk w okolicy zatok',
      'sore_throat': 'Ból gardła',
      'hoarseness': 'Chrypka',
      'dry_cough': 'Kaszel suchy',
      'wet_cough': 'Kaszel mokry',
      'swollen_tonsils': 'Spuchnięte migdałki',
      'chest_heaviness': 'Uczucie ciężkości w klatce piersiowej',
      'dyspnea': 'Duszność',
      'wheezing': 'Świszczący oddech',
      'chest_pain_breathing': 'Ból w klatce piersiowej przy oddychaniu',
      'watery_eyes': 'Łzawienie oczu',
      // gastro
      'nausea': 'Nudności',
      'vomiting': 'Wymioty',
      'watery_diarrhea': 'Biegunka wodnista',
      'mucus_diarrhea': 'Biegunka ze śluzem',
      'bloody_diarrhea': 'Biegunka z krwią',
      'abdominal_pain': 'Ból brzucha',
      'no_appetite': 'Brak apetytu',
      'food_poisoning': 'Zatrucie pokarmowe',
      'heartburn': 'Zgaga',
      'dehydration': 'Odwodnienie (suchość w ustach, małe ilości moczu)',
      'bloating': 'Wzdęcia',
      'gas': 'Gazy',
      'fullness': 'Uczucie rozpierania',
      // bladder
      'frequent_urination': 'Częste oddawanie moczu',
      'pollakiuria': 'Częstomocz',
      'oliguria': 'Skąpomocz',
      'painful_urination': 'Bolesne oddawanie moczu',
      'bladder_pain': 'Ból pęcherza',
      'urge': 'Parcie na mocz',
      'bladder_pressure': 'Parcie na pęcherz',
      'burning_urination': 'Pieczenie przy oddawaniu moczu',
      'lower_abdominal_pain': 'Ból w podbrzuszu',
      'lower_belly_pressure': 'Ból ucisk w dole brzucha',
      'groin_radiation': 'Ból promieniujący do krocza lub pachwin',
      'cloudy_urine': 'Mętny lub intensywny kolor moczu',
      'blood_in_urine': 'Krew w moczu',
      // injury
      'head': 'Głowa i czaszka',
      'neck': 'Szyja',
      'back': 'Plecy',
      'spine': 'Kręgosłup',
      'chest': 'Klatka piersiowa',
      'abdomen': 'Brzuch',
      'pelvis': 'Miednica',
      'shoulder': 'Barki i ramię',
      'forearm': 'Przedramię',
      'elbow': 'Łokieć',
      'hand': 'Ręka/nadgarstek',
      'hip': 'Biodro',
      'thigh': 'Udo',
      'knee': 'Kolano',
      'shin': 'Podudzie',
      'ankle': 'Staw skokowy/stopa',
      'lumbar_area_pain': 'Ból w okolicy lędźwiowej',
      'lumbar_spine_pain': 'Ból kręgosłupa lędźwiowego',
      'sprain': 'Skręcenie stawu',
      'strain': 'Nadwyrężenie / przeciążenie',
      'pain_on_movement': 'Ból przy ruchu',
      'limited_mobility': 'Ograniczenie ruchomości',
      'swelling': 'Obrzęk',
      'bruise': 'Stłuczenie',
      'discoloration': 'Zasinienie, zaczerwienienie',
      'tenderness': 'Tkliwość przy dotyku',
      'stiffness': 'Sztywność',
      'pain_worse_on_movement': 'Ból nasilający się przy ruchu',
      'hematoma': 'Krwiak',
      'joint_instability': 'Uczucie uciekania stawu',
      'deformity': 'Deformacja kończyny',
      'numbness': 'Brak czucia',
      'paresthesia': 'Drętwienie',
      'tingling_injury': 'Mrowienie',
      // menstruation
      'severe_pain': 'Silne bóle miesiączkowe',
      'painful_start': 'Bolesny początek miesiączki',
      'lower_abdominal_pain_mens': 'Ból podbrzusza',
      'abdominal_fullness': 'Uczucie rozpierania w podbrzuszu',
      'heavy_bleeding': 'Obfite krwawienie',
      'blood_clots': 'Skrzepy krwi',
      'abdominal_tenderness': 'Tkliwość brzucha',
      'breast_tenderness': 'Tkliwość piersi',
      'lower_back_pain': 'Ból krzyża',
      'swelling_mens': 'Obrzęk',
      'fever_mens': 'Gorączka',
      'irritation': 'Rozdrażnienie',
      'fatigue_low_mood': 'Zmęczenie, obniżony nastrój',
      'mood_swings': 'Wahania nastroju',
      'low_mood': 'Obniżony nastrój',
      'concentration_difficulty': 'Trudność z koncentracją',
      // back_pain
      'back_spine': 'Ból pleców/kręgosłupa',
      'sciatica': 'Rwa kulszowa',
      'shoulder_radiculopathy': 'Rwa barkowa',
      'cervical_pain': 'Ból w odcinku szyjnym',
      'thoracic_pain': 'Ból w odcinku piersiowym',
      'upper_limb_radiation': 'Promieniowanie do kończyny górnej',
      'lower_limb_radiation': 'Promieniowanie do kończyny dolnej',
      'tingling': 'Mrowienie w kończynach',
      'sitting_pain': 'Ból w pozycji siedzącej',
      'lumbar_pain': 'Ból w odcinku lędźwiowo-krzyżowym',
      'lifting_problem': 'Problem z podnoszeniem ciężkich przedmiotów',
      'standing_pain': 'Ból w pozycji stojącej',
      // eye
      'burning': 'Pieczenie',
      'redness': 'Zaczerwienienie oczu',
      'tearing': 'Łzawienie',
      'gritty': 'Uczucie piasku pod powiekami',
      'discharge': 'Ropa w oczach',
      // migraine
      'photophobia': 'Światłowstręt',
      'confusion': 'Rozkojarzenie',
      'history': 'Migrena rozpoznana w przeszłości',
      // acute_stress & psych
      'family_problems': 'Problemy rodzinne',
      'divorce': 'Stres (rozwód)',
      'family_issues': 'Stres (problemy rodzinne)',
      'death': 'Stres (śmierć bliskiej osoby)',
      'work': 'Stres (praca)',
      'job_loss': 'Stres (utrata pracy)',
      // child-specific stress
      'school_stress': 'Stres związany ze szkołą',
      'peer_issues': 'Problemy z rówieśnikami',
    };
    return labels[symptom] || symptom;
  };

  const getDurationLabel = (duration: string) => {
    const labels: Record<string, string> = {
      'today': 'Od dziś',
      'yesterday': 'Od wczoraj',
      '2_3': '2-3 dni',
      '4_5': '4-5 dni',
      'gt_5': 'Ponad 5 dni'
    };
    return labels[duration] || duration;
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
          {/* Dane wnioskującego (rodzica/opiekuna) */}
          <Card>
            <CardHeader>
              <CardTitle>{isChildCare ? "Dane rodzica / opiekuna" : "Dane osobowe"}</CardTitle>
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

          {/* Dane podopiecznego - dla opieki nad dzieckiem lub członkiem rodziny */}
          {isCareLeave && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isChildCare ? <Baby className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                  {isChildCare ? "Dane dziecka" : "Dane osoby chorej"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isChildCare ? "Imię i nazwisko dziecka:" : "Imię i nazwisko:"}
                  </span>
                  <span className="font-medium">{patientName} {patientLastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isChildCare ? "PESEL dziecka:" : "PESEL:"}
                  </span>
                  <span className="font-medium">{patientPesel}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Okres zwolnienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zwolnienie od dnia:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_start 
                    ? format(new Date(formData.datyChoroby.illness_start), 'dd.MM.yyyy', { locale: pl })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zwolnienie do dnia:</span>
                <span className="font-medium">
                  {formData.datyChoroby?.illness_end 
                    ? format(new Date(formData.datyChoroby.illness_end), 'dd.MM.yyyy', { locale: pl })
                    : '-'}
                </span>
              </div>
              {formData.datyChoroby?.late_justification && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uzasadnienie:</span>
                  <span className="font-medium text-right max-w-[60%]">{formData.datyChoroby.late_justification}</span>
                </div>
              )}
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
              <CardTitle>
                {isCareLeave ? `Wywiad medyczny ${getPatientLabel()}` : "Wywiad medyczny"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  {isCareLeave ? `Stan zdrowia ${getPatientLabel()}:` : "Wywiad ogólny:"}
                </h4>
                
                {/* Ciąża - tylko dla dorosłych (nie dla opieki) */}
                {!isCareLeave && formData.wywiadOgolny?.q_pregnant && (
                  <div>
                    <span className="text-muted-foreground">Ciąża: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_pregnant === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
                
                {!isCareLeave && formData.wywiadOgolny?.q_pregnant === 'yes' && formData.wywiadOgolny?.q_preg_leave && (
                  <div>
                    <span className="text-muted-foreground">Zwolnienie związane z ciążą: </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_preg_leave === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_chronic && (
                  <div>
                    <span className="text-muted-foreground">
                      {isCareLeave ? `Choroby przewlekłe ${getPatientLabel()}: ` : "Choroby przewlekłe: "}
                    </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_chronic === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_chronic === 'yes' && formData.wywiadOgolny.chronic_list?.length > 0 && (
                      <div className="ml-4 mt-1 text-sm">
                        {formData.wywiadOgolny.chronic_list.map((condition: string) => (
                          condition === 'other' && formData.wywiadOgolny.chronic_other_text 
                            ? <div key={condition}>• Inne: {formData.wywiadOgolny.chronic_other_text}</div>
                            : <div key={condition}>• {getChronicConditionLabel(condition)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_allergy && (
                  <div>
                    <span className="text-muted-foreground">
                      {isCareLeave ? `Alergie ${getPatientLabel()}: ` : "Alergie: "}
                    </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_allergy === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_allergy === 'yes' && formData.wywiadOgolny.allergy_text && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.allergy_text}</div>
                    )}
                  </div>
                )}
                
                {formData.wywiadOgolny?.q_meds && (
                  <div>
                    <span className="text-muted-foreground">
                      {isCareLeave ? `Leki przyjmowane przez ${patientName}: ` : "Przyjmowane leki: "}
                    </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_meds === 'yes' ? 'Tak' : 'Nie'}</span>
                    {formData.wywiadOgolny.q_meds === 'yes' && formData.wywiadOgolny.meds_list && (
                      <div className="ml-4 mt-1 text-sm">{formData.wywiadOgolny.meds_list}</div>
                    )}
                  </div>
                )}
                
                {/* Długotrwałe zwolnienie - tylko dla osobistych zwolnień */}
                {!isCareLeave && formData.wywiadOgolny?.q_long_leave && (
                  <div>
                    <span className="text-muted-foreground">Długotrwałe zwolnienie (powyżej 33 dni w roku): </span>
                    <span className="font-medium">{formData.wywiadOgolny.q_long_leave === 'yes' ? 'Tak' : 'Nie'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm">
                  {isCareLeave ? `Objawy i dolegliwości ${getPatientLabel()}:` : "Objawy i dolegliwości:"}
                </h4>
                
                {formData.wywiadObjawy?.main_category && (
                  <div>
                    <span className="text-muted-foreground">Kategoria: </span>
                    <span className="font-medium">{getMainCategoryLabel(formData.wywiadObjawy.main_category)}</span>
                  </div>
                )}
                
                {formData.wywiadObjawy?.symptom_duration && (
                  <div>
                    <span className="text-muted-foreground">
                      {isCareLeave ? `Czas trwania objawów ${getPatientLabel()}: ` : "Czas trwania objawów: "}
                    </span>
                    <span className="font-medium">
                      {getDurationLabel(formData.wywiadObjawy.symptom_duration)}
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
                    <span className="text-muted-foreground">
                      {isCareLeave ? `Opis dolegliwości ${getPatientLabel()}: ` : "Opis dolegliwości: "}
                    </span>
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
                <span className="text-lg">E-konsultacja + e-zwolnienie:</span>
                <span className="text-2xl font-bold text-primary">79 PLN</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Ważne:</strong> Lekarz może skontaktować się z Tobą telefonicznie w celu pogłębienia wywiadu medycznego. 
              E-konsultacja nie gwarantuje wystawienia e-zwolnienia - ostateczną decyzję podejmuje lekarz na podstawie 
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
