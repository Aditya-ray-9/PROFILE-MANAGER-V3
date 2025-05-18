import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { UserPreferences } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Paintbrush, Moon, Sun, MonitorSmartphone, Globe, Bell, Layout } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserPreferences;
  onSavePreferences: (preferences: UserPreferences) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  preferences,
  onSavePreferences,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserPreferences>(preferences);

  const handleSave = () => {
    onSavePreferences(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Profile Manager experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-5">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => {
                      setTheme("light");
                      setSettings({ ...settings, theme: "light" });
                    }}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => {
                      setTheme("dark");
                      setSettings({ ...settings, theme: "dark" });
                    }}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => {
                      setTheme("system");
                      setSettings({ ...settings, theme: "system" });
                    }}
                  >
                    <MonitorSmartphone className="h-5 w-5" />
                    <span>System</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Paintbrush className="h-5 w-5 text-gray-500" />
                  <Input
                    id="accentColor"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more profiles with a compact layout
                  </p>
                </div>
                <Switch
                  checked={settings.compactView}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, compactView: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="cardsPerPage">Profiles Per Page</Label>
                  <span className="text-sm text-muted-foreground">{settings.cardsPerPage}</span>
                </div>
                <Slider
                  id="cardsPerPage"
                  min={3}
                  max={12}
                  step={3}
                  value={[settings.cardsPerPage]}
                  onValueChange={(value) => 
                    setSettings({ ...settings, cardsPerPage: value[0] })
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about profile updates
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, notificationsEnabled: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Display Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}