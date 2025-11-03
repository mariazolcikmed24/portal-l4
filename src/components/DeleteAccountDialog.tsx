import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DeleteAccountDialogProps {
  userEmail: string;
}

export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      toast.error('Email nie pasuje');
      return;
    }

    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Brak sesji użytkownika');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { confirmEmail },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error deleting account:', error);
        toast.error('Nie udało się usunąć konta');
        return;
      }

      if (data?.success) {
        toast.success('Twoje konto zostało usunięte');
        // Wyloguj użytkownika i przekieruj na stronę główną
        await supabase.auth.signOut();
        navigate('/');
      } else {
        toast.error(data?.error || 'Nie udało się usunąć konta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Wystąpił błąd podczas usuwania konta');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Usuń konto
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Ta akcja jest nieodwracalna. Zostanie usunięte:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Twoje konto użytkownika</li>
              <li>Wszystkie dane osobowe</li>
              <li>Historia złożonych wniosków</li>
              <li>Logi dostępu (audit logs)</li>
            </ul>
            <div className="space-y-2 pt-4">
              <Label htmlFor="confirm-email">
                Wpisz swój email ({userEmail}) aby potwierdzić:
              </Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={userEmail}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmEmail !== userEmail || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń konto na zawsze'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
