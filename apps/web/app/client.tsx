'use client';
import { Button } from '@oe/ui/shadcn/button';
import { toast } from '@oe/ui/shadcn/sonner';

export default function Client() {
  return (
    <Button
      variant="destructive"
      onClick={() =>
        toast.warning('Hellow', {
          description: 'aaaaaaaaaa',
          duration: 5000000,
        })
      }
    >
      client
    </Button>
  );
}
