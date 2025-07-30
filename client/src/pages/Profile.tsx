import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Edit, Calendar, Building } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/i18n";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  institutionId: number;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  registrationDate?: string;
  lastUpdate?: string;
}

interface Institution {
  id: number;
  name: string;
  type: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  // Fetch institution data
  const { data: institution } = useQuery<Institution>({
    queryKey: ["/api/institutions", user?.institutionId],
    enabled: !!user?.institutionId,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileUpdatedDesc'),
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: t('profile.error'),
        description: t('profile.updateError'),
        variant: "destructive",
      });
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      return fetch("/api/user/profile/photo", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('profile.fileTooBig'),
          description: t('profile.fileSizeError'),
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: t('profile.invalidFormat'),
          description: t('profile.imageFormatError'),
          variant: "destructive",
        });
        return;
      }
      
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const getUserPhoto = () => {
    if ((user as any)?.email === 'calvarado@nebusis.com') {
      return "/api/assets/Celso Professional_1753269775786.jpg";
    }
    if ((user as any)?.email === 'ymontoya@qsiglobalventures.com') {
      return "/api/assets/image_1753270776387.png";
    }
    return profile?.profilePhoto || null;
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t('profile.profilePhoto')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block">
                  {getUserPhoto() ? (
                    <img
                      src={getUserPhoto()!}
                      alt={t('profile.profilePhoto')}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary/100 mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-primary/100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary transition-colors">
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadPhotoMutation.isPending}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
{t('profile.clickToChange')}
                </p>
                <p className="text-xs text-gray-400 mt-2">
{t('profile.supportedFormats')}
                </p>
                {uploadPhotoMutation.isPending && (
                  <p className="text-sm text-primary mt-2">{t('profile.saving')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('profile.personalInformation')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile.personalInfoDesc')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? t('profile.cancel') : t('profile.edit')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">{t('profile.firstName')}</Label>
                    {isEditing ? (
                      <Input
                        id="nombre"
                        value={profileData.firstName || (user as any)?.name?.split(' ')[0] || ""}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        placeholder={t('profile.enterFirstName')}
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">
                        {(user as any)?.name?.split(' - ')[0]?.split(' ')[0] || t('profile.notAvailable')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="apellido">{t('profile.lastName')}</Label>
                    {isEditing ? (
                      <Input
                        id="apellido"
                        value={profileData.lastName || ""}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        placeholder={t('profile.enterLastName')}
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">
                        {(user as any)?.name?.split(' - ')[0]?.split(' ').slice(1).join(' ') || t('profile.notAvailable')}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label>{t('profile.email')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900">{user?.email}</span>
                    <Badge variant="secondary" className="text-xs">{t('profile.verified')}</Badge>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? t('profile.saving') : t('profile.save')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
{t('profile.cancel')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t('profile.accountInformation')}
                </CardTitle>
                <CardDescription>
                  {t('profile.accountInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('profile.systemRole')}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">
                        {user?.role === 'admin' ? t('profile.administrator') : user?.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>{t('profile.institution')}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {institution?.name || "Ministerio Modelo"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
{t('profile.registrationDate')}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
{t('profile.lastUpdate')}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{t('profile.notAvailable')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}