import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { KeyRound, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

type ConfirmAction =
  | { type: "deleteUser"; userId: number; label: string }
  | { type: "sendLink"; userId: number; label: string }
  | null;

export function AdminManagement() {
  const { user } = useAuth();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: allUsers, isLoading } = trpc.team.listAllUsers.useQuery();
  const sendSetupLink = trpc.team.sendSetupLink.useMutation();
  const deleteUser = trpc.team.deleteUser.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Você não tem permissão para acessar esta seção.
        </AlertDescription>
      </Alert>
    );
  }

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSendLink = async (userId: number) => {
    resetMessages();
    setBusyId(userId);
    try {
      const res = await sendSetupLink.mutateAsync({ userId });
      if (res.emailSent) {
        setSuccess(`Link de criação de senha enviado para ${res.email}.`);
        toast.success("Link enviado por e-mail.");
      } else {
        setError(
          `O link foi gerado, mas o envio do e-mail falhou para ${res.email}. Verifique a configuração de e-mail.`,
        );
      }
    } catch (err: any) {
      setError(err.message || "Erro ao enviar link de criação de senha.");
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    resetMessages();
    setBusyId(userId);
    try {
      await deleteUser.mutateAsync({ userId });
      setSuccess("Usuário apagado com sucesso.");
      toast.success("Usuário apagado.");
      utils.team.listAllUsers.invalidate();
    } catch (err: any) {
      setError(err.message || "Erro ao apagar usuário.");
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "deleteUser") handleDeleteUser(confirm.userId);
    else if (confirm.type === "sendLink") handleSendLink(confirm.userId);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Envie links de criação de senha e gerencie o acesso de todos os usuários do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : allUsers && allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name || "Sem nome"}
                        {u.id === user.id && (
                          <Badge variant="secondary" className="ml-2">
                            Você
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "outline"}>
                          {u.role === "admin" ? "Administrador" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.hasPassword ? (
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            Definida
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(u.lastSignedIn)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() =>
                              setConfirm({
                                type: "sendLink",
                                userId: u.id,
                                label: u.email || "este usuário",
                              })
                            }
                          >
                            {u.hasPassword ? (
                              <Mail className="h-4 w-4 mr-1" />
                            ) : (
                              <KeyRound className="h-4 w-4 mr-1" />
                            )}
                            {u.hasPassword ? "Redefinir senha" : "Criar senha"}
                          </Button>
                          {u.id !== user.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={busyId === u.id}
                              onClick={() =>
                                setConfirm({
                                  type: "deleteUser",
                                  userId: u.id,
                                  label: u.email || "este usuário",
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Apagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {confirm?.type === "deleteUser"
              ? "Apagar usuário?"
              : "Enviar link de senha?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirm?.type === "deleteUser"
              ? `Esta ação não pode ser desfeita. ${confirm?.label} perderá o acesso e será removido do sistema.`
              : `Um e-mail com um link para criar/redefinir a senha será enviado para ${confirm?.label}. O link expira em 7 dias.`}
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirm?.type === "deleteUser"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {confirm?.type === "deleteUser" ? "Apagar" : "Enviar link"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
