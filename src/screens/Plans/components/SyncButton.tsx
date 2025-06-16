import React from 'react';
import { Button } from "../../../components/ui/button";

interface SyncButtonProps {
  onSync: () => Promise<void>;
  syncing: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ onSync, syncing }) => {
  return (
    <Button
      onClick={onSync}
      disabled={syncing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 border-gray-200 hover:border-gray-300 rounded-xl"
    >
      {syncing ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Sincronizando...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>Sincronizar</span>
        </div>
      )}
    </Button>
  );
};