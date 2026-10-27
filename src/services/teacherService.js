// src/services/teacherService.js
/**
 * 👨‍🏫 Sovereign Teacher LMS Service for Test.me
 * Sinflar, topshiriqlar, join-kodlar va o'quvchilar tahlilini
 * boshqaruvchi markaziy servis (Supabase + Offline Fallback).
 */
import { supabase } from '@/config/supabase';
import { offlineDb } from './offlineDb';

// Yordamchi: 6 xonali unikal Join-Code yaratish (Masalan: TM-7842)
export function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TM-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const teacherService = {
  /**
   * O'qituvchining barcha sinflarini olish
   */
  async getClasses(teacherId) {
    if (!teacherId) return [];

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, subjects(id, name_uz, name_ru, color, icon)')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getClasses xatosi, oflayn kesh tekshirilmoqda:', error.message);
        const cached = await offlineDb.getCachedMetadata(`teacher_classes_${teacherId}`);
        return cached || [];
      }

      if (data) {
        offlineDb.cacheMetadata(`teacher_classes_${teacherId}`, data);
        return data;
      }
      return [];
    } catch {
      const cached = await offlineDb.getCachedMetadata(`teacher_classes_${teacherId}`);
      return cached || [];
    }
  },

  /**
   * Yangi sinf yaratish
   */
  async createClass(classData) {
    const code = classData.join_code || generateJoinCode();
    const payload = {
      teacher_id: classData.teacher_id,
      name: classData.name,
      subject_id: classData.subject_id || null,
      grade: classData.grade || '',
      join_code: code,
      academic_year: classData.academic_year || '2026-2027',
      is_active: true,
    };

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Sinf yaratishda xatolik:', err);
      // Oflayn rejim uchun mock qaytarish
      return {
        id: 'local_class_' + Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Sinfdagi o'quvchilar ro'yxatini olish
   */
  async getClassStudents(classId) {
    if (!classId) return [];

    try {
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          id,
          joined_at,
          status,
          profiles (
            id,
            username,
            email,
            photo_url,
            points
          )
        `)
        .eq('class_id', classId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('getClassStudents xatosi:', err);
      return [];
    }
  },

  /**
   * Sinfga berilgan topshiriqlarni olish
   */
  async getClassAssignments(classId) {
    if (!classId) return [];

    try {
      const { data, error } = await supabase
        .from('class_assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('getClassAssignments xatosi:', err);
      return [];
    }
  },

  /**
   * Yangi topshiriq biriktirish
   */
  async createAssignment(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('class_assignments')
        .insert(assignmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Topshiriq yaratishda xatolik:', err);
      throw err;
    }
  },

  /**
   * Talaba Join-Code orqali sinfga qo'shilishi
   */
  async joinClassByCode(studentId, joinCode) {
    if (!studentId || !joinCode) {
      throw new Error('Talaba ID va Kod kiritilishi shart');
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // 1. Kod bo'yicha sinfni topish
    const { data: targetClass, error: classError } = await supabase
      .from('classes')
      .select('id, name, is_active')
      .ilike('join_code', cleanCode)
      .maybeSingle();

    if (classError || !targetClass) {
      throw new Error('Bunday kodli sinf topilmadi. Kodni qayta tekshiring.');
    }

    if (!targetClass.is_active) {
      throw new Error('Ushbu sinf hozirda faol emas.');
    }

    // 2. Sinfga yozish
    const { data, error: joinError } = await supabase
      .from('class_students')
      .insert({
        class_id: targetClass.id,
        student_id: studentId,
        status: 'active',
      })
      .select()
      .single();

    if (joinError) {
      if (joinError.code === '23505') {
        throw new Error('Siz allaqachon ushbu sinfga qo\'shilgansiz.');
      }
      throw joinError;
    }

    return {
      class: targetClass,
      enrollment: data,
    };
  },

  /**
   * Talabaning a'zo bo'lgan sinflarini olish
   */
  async getStudentClasses(studentId) {
    if (!studentId) return [];

    try {
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          class_id,
          status,
          classes (
            id,
            name,
            grade,
            teacher_id,
            created_at,
            profiles:teacher_id (
              username,
              photo_url
            )
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');

      if (error) throw error;
      return (data || []).map(item => item.classes).filter(Boolean);
    } catch (err) {
      console.warn('getStudentClasses xatosi:', err);
      return [];
    }
  },
};
