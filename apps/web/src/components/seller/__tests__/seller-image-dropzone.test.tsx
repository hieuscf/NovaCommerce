import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SellerImageDropzone } from '../seller-image-dropzone';

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('SellerImageDropzone', () => {
  it('uploads a file and can remove it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File([new Uint8Array([1, 2, 3])], 'logo.png', { type: 'image/png' });

    const { rerender } = render(
      <SellerImageDropzone
        id="seller-shopLogo"
        label="Shop Logo"
        required
        hint="PNG, JPG (max 2MB)"
        value={null}
        onChange={onChange}
      />,
    );

    await user.upload(screen.getByLabelText(/shop logo/i), file);

    expect(onChange).toHaveBeenCalledWith(file);

    rerender(
      <SellerImageDropzone
        id="seller-shopLogo"
        label="Shop Logo"
        required
        hint="PNG, JPG (max 2MB)"
        value={file}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove Shop Logo' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
