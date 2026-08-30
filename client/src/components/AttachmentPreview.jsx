import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

const AttachmentPreview = ({ attachments = [], onRemoveAttachment }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 px-2 animate-fadeIn">
      {attachments.map((att, index) => {
        const isImg = att.type === 'image';

        return (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/90 text-white text-xs shadow-md border border-white/10 backdrop-blur-md"
          >
            {isImg ? (
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                <img src={att.data} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <FileText className="w-4 h-4 text-purple-300 flex-shrink-0" />
            )}

            <span className="max-w-[140px] truncate font-medium">{att.name || 'Attachment'}</span>

            <button
              type="button"
              onClick={() => onRemoveAttachment(index)}
              className="p-0.5 rounded-full hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentPreview;
