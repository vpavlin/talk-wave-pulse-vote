
import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ErrorState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-6 w-6 text-destructive" />
            Error Loading Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We couldn't load the event details. The event may have been removed or you may not have access.</p>
          <Link to="/">
            <Button variant="default" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
