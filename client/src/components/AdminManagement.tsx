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

export function AdminManagement() {
  const { user } = useAuth();
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [action, setAction] = useState<"delete" | "demote" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: admins, isLoading, refetch } = trpc.doctorAuth.listAdmins.useQuery();
  const deleteAdminMutation = trpc.doctorAuth.deleteAdmin.useMutation();
  const updateRoleMutation = trpc.doctorAuth.updateAdminRole.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Você não tem permissão para acessar esta página.
        </AlertDescription>
      </Alert>
    );
  }

  const handleDeleteAdmin = async () => {
    if (!selectedAdminId) return;

    try {
      await deleteAdminMutation.mutateAsync({ userId: selectedAdminId });
      setSuccess("Admin deletado com sucesso.");
      setSelectedAdminId(null);
      setAction(null);
      refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar admin.");
    }
  };

  const handleDemoteAdmin = async () => {
    if (!selectedAdminId) return;

    try {
      await updateRoleMutation.mutateAsync({
        userId: selectedAdminId,
        newRole: "user",
      });
      setSuccess("Admin rebaixado para usuário comum.");
      setSelectedAdminId(null);
      setAction(null);
      refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao rebaixar admin.");
    }
  };

  const handleConfirm = () => {
    if (action === "delete") {
      handleDeleteAdmin();
    } else if (action === "demote") {
      handleDemoteAdmin();
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Administradores</CardTitle>
          <CardDescription>
            Gerencie os administradores do sistema
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
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : admins && admins.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Método de Login</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.name || "Sem nome"}
                        {admin.id === user.id && (
                          <Badge variant="secondary" className="ml-2">
                            Você
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            admin.loginMethod === "local"
                              ? "default"
                              : "outline"
                          }
                        >
                          {admin.loginMethod === "local"
                            ? "Local"
                            : "Manus OAuth"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      <TableCell>{formatDate(admin.lastSignedIn)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {admin.id !== user.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdminId(admin.id);
                                  setAction("demote");
                                }}
                              >
                                Rebaixar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdminId(admin.id);
                                  setAction("delete");
                                }}
                              >
                                Deletar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum admin encontrado.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {action === "delete"
              ? "Deletar Administrador?"
              : "Rebaixar Administrador?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === "delete"
              ? "Esta ação não pode ser desfeita. O administrador será removido do sistema."
              : "O administrador será rebaixado para usuário comum e perderá acesso às funções administrativas."}
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
            >
              {action === "delete" ? "Deletar" : "Rebaixar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
