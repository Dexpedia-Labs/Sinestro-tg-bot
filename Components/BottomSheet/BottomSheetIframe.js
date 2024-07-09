import React from 'react';
import { Sheet } from 'react-modal-sheet';

const BottomSheetIframe = ({ open, url, onClose }) => {
  return (
    <Sheet isOpen={open} onClose={onClose}>
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          <iframe src={url} width="100%" height="100%" style={{ border: 'none' }} />
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default BottomSheetIframe;
