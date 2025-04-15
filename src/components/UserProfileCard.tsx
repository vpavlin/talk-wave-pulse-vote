
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveUserInfo, getUserInfo } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";
import { User, Edit2, Check } from "lucide-react";

const UserProfileCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const userInfo = getUserInfo();
    setName(userInfo.name);
    setBio(userInfo.bio);
  }, []);

  const handleSave = () => {
    saveUserInfo(name, bio);
    setIsEditing(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/30 mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-purple-200 flex items-center">
          <User className="mr-2 h-5 w-5" />
          Speaker Profile
        </CardTitle>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 text-purple-200 border-purple-500 hover:bg-purple-800/30"
          >
            <Edit2 className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            className="h-8 text-green-200 border-green-500 hover:bg-green-800/30"
          >
            <Check className="h-4 w-4 mr-1" /> Save
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-purple-200">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-gray-800/60 border-purple-700/50 text-white"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-purple-200">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 bg-gray-800/60 border-purple-700/50 text-white"
                placeholder="Brief professional bio (max 150 characters)"
                maxLength={150}
              />
              <p className="text-xs text-right text-purple-300 mt-1">{bio.length}/150</p>
            </div>
          </div>
        ) : (
          <div>
            {name ? (
              <h3 className="text-lg text-white font-medium">{name}</h3>
            ) : (
              <p className="text-gray-400 italic">No name set</p>
            )}
            
            {bio ? (
              <p className="text-gray-300 mt-2">{bio}</p>
            ) : (
              <p className="text-gray-400 italic mt-2">No bio provided. Click Edit to add your information.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
