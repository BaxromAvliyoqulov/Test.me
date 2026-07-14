import Swal from 'sweetalert2';

export const confirmDelete = async (title = "Haqiqatan ham o'chirasizmi?", text = "Bu amalni ortga qaytarib bo'lmaydi!") => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ha, tasdiqlayman!',
    cancelButtonText: 'Bekor qilish',
    backdrop: `rgba(15, 23, 42, 0.6)`,
    customClass: {
      popup: 'swal-premium-popup'
    }
  });
  return result.isConfirmed;
};
