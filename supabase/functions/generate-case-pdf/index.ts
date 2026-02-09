import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePdfRequest {
  case_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { case_id }: GeneratePdfRequest = await req.json();

    if (!case_id) {
      return new Response(
        JSON.stringify({ error: 'case_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating PDF summary for case: ${case_id}`);

    // Fetch case with profile data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*, profile:profiles(*)')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profile = caseData.profile;
    
    // Helper to remove Polish diacritics (StandardFonts don't support them)
    const removeDiacritics = (text: string): string => {
      const polishMap: Record<string, string> = {
        'ą': 'a', 'Ą': 'A',
        'ć': 'c', 'Ć': 'C',
        'ę': 'e', 'Ę': 'E',
        'ł': 'l', 'Ł': 'L',
        'ń': 'n', 'Ń': 'N',
        'ó': 'o', 'Ó': 'O',
        'ś': 's', 'Ś': 'S',
        'ź': 'z', 'Ź': 'Z',
        'ż': 'z', 'Ż': 'Z',
      };
      return text.split('').map(char => polishMap[char] || char).join('');
    };
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { height } = page.getSize();
    let y = height - 50;
    const leftMargin = 50;
    const lineHeight = 18;

    const drawText = (text: string, options: { bold?: boolean; size?: number } = {}) => {
      const { bold = false, size = 11 } = options;
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }
      // Remove Polish diacritics before rendering
      const safeText = removeDiacritics(text);
      page.drawText(safeText, {
        x: leftMargin,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };

    const drawSection = (title: string) => {
      y -= 10;
      drawText(title, { bold: true, size: 13 });
      y -= 5;
    };

    // Helper functions for labels
    const getCategoryLabel = (cat: string) => {
      const labels: Record<string, string> = {
        'cold_pain': 'Przeziebienie lub bole',
        'gastro': 'Zatrucie i problemy zoladkowe',
        'bladder': 'Problemy z pecherzem',
        'injury': 'Urazy',
        'menstruation': 'Menstruacja',
        'back_pain': 'Bole plecow',
        'eye': 'Problemy z oczami',
        'migraine': 'Migrena',
        'acute_stress': 'Ostre reakcje na stres',
        'psych': 'Problemy psychologiczne',
      };
      return labels[cat] || cat;
    };

    const getDurationLabel = (dur: string) => {
      const labels: Record<string, string> = {
        'today': 'Dzisiaj',
        'yesterday': 'Wczoraj',
        '2_3': '2-3 dni',
        '4_5': '4-5 dni',
        'gt_5': 'Ponad 5 dni',
      };
      return labels[dur] || dur;
    };

    const getRecipientLabel = (type: string) => {
      const labels: Record<string, string> = {
        'pl_employer': 'Polski pracodawca',
        'uniformed': 'Sluzby mundurowe',
        'student': 'Student/Uczen',
        'foreign_employer': 'Pracodawca zagraniczny',
        'care': 'Zwolnienie na dziecko',
      };
      return labels[type] || type;
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    // Title
    drawText('PODSUMOWANIE WYWIADU MEDYCZNEGO', { bold: true, size: 16 });
    drawText(`e-zwolnienie.com.pl | Sprawa: ${caseData.case_number || case_id}`, { size: 9 });
    drawText(`Data wygenerowania: ${formatDate(new Date().toISOString())}`, { size: 9 });

    // Patient data
    drawSection('DANE PACJENTA');
    if (profile) {
      drawText(`Imie i nazwisko: ${profile.first_name} ${profile.last_name}`);
      drawText(`PESEL: ${profile.pesel}`);
      drawText(`Data urodzenia: ${formatDate(profile.date_of_birth)}`);
      drawText(`Telefon: ${profile.phone}`);
      drawText(`Email: ${profile.email}`);
      drawText(`Adres: ${profile.street} ${profile.house_no}${profile.flat_no ? '/' + profile.flat_no : ''}`);
      drawText(`         ${profile.postcode} ${profile.city}`);
    }

    // Leave dates
    drawSection('OKRES ZWOLNIENIA');
    drawText(`Zwolnienie od dnia: ${formatDate(caseData.illness_start)}`);
    drawText(`Zwolnienie do dnia: ${formatDate(caseData.illness_end)}`);
    if (caseData.late_justification) {
      drawText(`Uzasadnienie poznego zgloszenia: ${caseData.late_justification}`);
    }

    // Leave type
    drawSection('TYP ZWOLNIENIA');
    drawText(`Odbiorca: ${getRecipientLabel(caseData.recipient_type)}`);

    // General medical history
    drawSection('WYWIAD OGOLNY');
    drawText(`Ciaza: ${caseData.pregnant ? 'Tak' : 'Nie'}`);
    if (caseData.pregnant && caseData.pregnancy_leave) {
      drawText(`Zwolnienie zwiazane z ciaza: Tak`);
    }
    
    drawText(`Choroby przewlekle: ${caseData.chronic_conditions?.length > 0 ? 'Tak' : 'Nie'}`);
    if (caseData.chronic_conditions?.length > 0) {
      const chronicLabels: Record<string, string> = {
        'autoimmune': 'Choroby autoimmunologiczne',
        'respiratory': 'Choroby ukladu oddechowego',
        'diabetes': 'Cukrzyca',
        'circulatory': 'Choroby ukladu krazenia',
        'cancer': 'Nowotwor',
        'osteoporosis': 'Osteoporoza',
        'epilepsy': 'Padaczka',
        'aids': 'AIDS',
        'obesity': 'Otylosc',
        'other': 'Inne',
      };
      const chronicList = caseData.chronic_conditions
        .filter((c: string) => c !== 'other')
        .map((c: string) => chronicLabels[c] || c)
        .join(', ');
      if (chronicList) {
        drawText(`  - ${chronicList}`);
      }
      if (caseData.chronic_conditions.includes('other') && caseData.chronic_other) {
        drawText(`  - Inne: ${caseData.chronic_other}`);
      }
    }

    drawText(`Alergie: ${caseData.has_allergy ? 'Tak' : 'Nie'}`);
    if (caseData.has_allergy && caseData.allergy_text) {
      drawText(`  - ${caseData.allergy_text}`);
    }

    drawText(`Przyjmowane leki: ${caseData.has_meds ? 'Tak' : 'Nie'}`);
    if (caseData.has_meds && caseData.meds_list) {
      drawText(`  - ${caseData.meds_list}`);
    }

    drawText(`Dlugotrwale zwolnienie (>33 dni/rok): ${caseData.long_leave ? 'Tak' : 'Nie'}`);

    // Symptoms
    drawSection('OBJAWY I DOLEGLIWOSCI');
    drawText(`Kategoria: ${getCategoryLabel(caseData.main_category)}`);
    drawText(`Czas trwania objawow: ${getDurationLabel(caseData.symptom_duration)}`);
    
    if (caseData.symptoms?.length > 0) {
      const symptomLabels: Record<string, string> = {
        // cold_pain
        'fever': 'Goraczka >38C',
        'subfebrile': 'Stan podgorączkowy',
        'fatigue': 'Zmeczenie/brak sil',
        'malaise': 'Uczucie rozbicia',
        'weakness': 'Oslabienie',
        'chills': 'Dreszcze',
        'muscle_pain': 'Bole miesni',
        'joint_pain': 'Bole stawow',
        'headache': 'Bol glowy',
        'dizziness': 'Zawroty glowy',
        'runny_nose': 'Katar',
        'sneezing': 'Kichanie',
        'stuffy_nose': 'Zatkany nos',
        'sinus_pain': 'Bol zatok',
        'sinus_pressure': 'Ucisk w okolicy zatok',
        'sore_throat': 'Bol gardla',
        'hoarseness': 'Chrypka',
        'dry_cough': 'Kaszel suchy',
        'wet_cough': 'Kaszel mokry',
        'swollen_tonsils': 'Spuchniete migdalki',
        'chest_heaviness': 'Uczucie ciezkosci w klatce piersiowej',
        'dyspnea': 'Dusznosc',
        'wheezing': 'Swiszczacy oddech',
        'chest_pain_breathing': 'Bol w klatce piersiowej przy oddychaniu',
        'watery_eyes': 'Lzawienie oczu',
        // gastro
        'nausea': 'Nudnosci',
        'vomiting': 'Wymioty',
        'watery_diarrhea': 'Biegunka wodnista',
        'mucus_diarrhea': 'Biegunka ze sluzem',
        'bloody_diarrhea': 'Biegunka z krwia',
        'abdominal_pain': 'Bol brzucha',
        'no_appetite': 'Brak apetytu',
        'food_poisoning': 'Zatrucie pokarmowe',
        'heartburn': 'Zgaga',
        'dehydration': 'Odwodnienie (suchosc w ustach, male ilosci moczu)',
        'bloating': 'Wzdecia',
        'gas': 'Gazy',
        'fullness': 'Uczucie rozpierania',
        // bladder
        'frequent_urination': 'Czeste oddawanie moczu',
        'pollakiuria': 'Czestomocz',
        'oliguria': 'Skapomocz',
        'painful_urination': 'Bolesne oddawanie moczu',
        'bladder_pain': 'Bol pecherza',
        'urge': 'Parcie na mocz',
        'bladder_pressure': 'Parcie na pecherz',
        'burning_urination': 'Pieczenie przy oddawaniu moczu',
        'lower_abdominal_pain': 'Bol w podbrzuszu',
        'lower_belly_pressure': 'Bol ucisk w dole brzucha',
        'groin_radiation': 'Bol promieniujacy do krocza lub pachwin',
        'cloudy_urine': 'Metny lub intensywny kolor moczu',
        'blood_in_urine': 'Krew w moczu',
        // injury
        'head': 'Glowa i czaszka',
        'neck': 'Szyja',
        'spine': 'Kregoslup',
        'chest': 'Klatka piersiowa',
        'abdomen': 'Brzuch',
        'pelvis': 'Miednica',
        'shoulder': 'Barki i ramie',
        'forearm': 'Przedramie',
        'elbow': 'Lokiec',
        'hand': 'Reka/nadgarstek',
        'hip': 'Biodro',
        'thigh': 'Udo',
        'knee': 'Kolano',
        'shin': 'Podudzie',
        'ankle': 'Staw skokowy/stopa',
        // menstruation
        'severe_pain': 'Silne bole miesiączkowe',
        'heavy_bleeding': 'Obfite krwawienie',
        'irritation': 'Rozdraznienie',
        'painful_start': 'Bolesny poczatek miesiaczki',
        // back_pain
        'back_spine': 'Bol plecow/kregoslupa',
        'sciatica': 'Rwa kulszowa',
        'shoulder_radiculopathy': 'Rwa barkowa',
        'cervical_pain': 'Bol w odcinku szyjnym',
        'thoracic_pain': 'Bol w odcinku piersiowym',
        'upper_limb_radiation': 'Promieniowanie do konczyny gornej',
        'lower_limb_radiation': 'Promieniowanie do konczyny dolnej',
        'tingling': 'Mrowienie w konczynach',
        'sitting_pain': 'Bol w pozycji siedzacej',
        'lumbar_pain': 'Bol w odcinku ledzwiowo-krzyzowym',
        'lifting_problem': 'Problem z podnoszeniem ciezkich przedmiotow',
        'standing_pain': 'Bol w pozycji stojacej',
        // eye
        'burning': 'Pieczenie',
        'redness': 'Zaczerwienienie oczu',
        'tearing': 'Lzawienie',
        'gritty': 'Uczucie piasku pod powiekami',
        'discharge': 'Ropa w oczach',
        // migraine
        'photophobia': 'Swiatlowstret',
        'confusion': 'Rozkojarzenie',
        'history': 'Migrena rozpoznana w przeszlosci',
        // acute_stress & psych
        'family_problems': 'Problemy rodzinne',
        'divorce': 'Stres (rozwod)',
        'family_issues': 'Stres (problemy rodzinne)',
        'death': 'Stres (smierc bliskiej osoby)',
        'work': 'Stres (praca)',
        'job_loss': 'Stres (utrata pracy)',
      };
      const symptomsList = caseData.symptoms.map((s: string) => symptomLabels[s] || s).join(', ');
      drawText(`Objawy: ${symptomsList}`);
    }

    // Free text description
    drawSection('OPIS DOLEGLIWOSCI');
    // Split long text into multiple lines
    const freeText = caseData.free_text_reason || '';
    const maxCharsPerLine = 80;
    const lines = [];
    let remaining = freeText;
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        lines.push(remaining);
        break;
      }
      let splitAt = remaining.lastIndexOf(' ', maxCharsPerLine);
      if (splitAt === -1) splitAt = maxCharsPerLine;
      lines.push(remaining.substring(0, splitAt));
      remaining = remaining.substring(splitAt).trim();
    }
    lines.forEach(line => drawText(line));

    // Footer
    y -= 20;
    drawText('Dokument wygenerowany automatycznie przez system e-zwolnienie.com.pl', { size: 9 });
    drawText('Ostateczna decyzja o wystawieniu zwolnienia nalezy do lekarza.', { size: 9 });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Upload to storage with readable filename
    const visitDate = new Date(caseData.created_at);
    const formattedDate = visitDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const safeFileName = `Wizyta_z_dnia_${formattedDate}.pdf`;
    const filePath = `summaries/${case_id}/${safeFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('case-attachments')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Failed to upload PDF:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update case with PDF path
    const currentAttachments = caseData.attachment_file_ids || [];
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        attachment_file_ids: [...currentAttachments, filePath],
      })
      .eq('id', case_id);

    if (updateError) {
      console.error('Failed to update case with PDF path:', updateError);
    }

    console.log(`PDF generated and uploaded: ${filePath}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_path: filePath,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
