import { supabaseAdmin as supabase } from '~/lib/supabase.server';

export async function getAllCompetitions() {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      participants:competition_participants(id, student_id)
    `)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching competitions:', error);
    return [];
  }

  return (data || []).map(comp => ({
    ...comp,
    participant_count: comp.participants?.length || 0
  }));
}

export async function getPublishedCompetitions() {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      participants:competition_participants(id, student_id)
    `)
    .eq('is_published', true)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching published competitions:', error);
    return [];
  }

  return (data || []).map(comp => ({
    ...comp,
    participant_count: comp.participants?.length || 0
  }));
}

export async function getCompetitionById(competitionId: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      participants:competition_participants(
        id,
        student:students(id, full_name, phone_number),
        registered_at,
        status,
        score,
        rank
      )
    `)
    .eq('id', competitionId)
    .single();

  if (error) {
    console.error('Error fetching competition:', error);
    return null;
  }

  return data;
}

export async function createCompetition(competitionData: {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  gatedCourseId?: string;
  isPublished?: boolean;
}) {
  const insertData: any = {
    title: competitionData.title,
    description: competitionData.description,
    date: competitionData.date,
    time: competitionData.time,
    duration: competitionData.duration,
    max_participants: competitionData.maxParticipants,
    status: 'upcoming',
    is_published: competitionData.isPublished || false,
  };
  if (competitionData.gatedCourseId) {
    insertData.gated_course_id = competitionData.gatedCourseId;
  }

  const { data, error } = await supabase
    .from('competitions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating competition:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCompetition(
  competitionId: string,
  competitionData: Partial<{
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    maxParticipants: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    gatedCourseId: string | null;
    isPublished: boolean;
    isFinished: boolean;
  }>
) {
  const updateData: any = {};
  if (competitionData.title) updateData.title = competitionData.title;
  if (competitionData.description) updateData.description = competitionData.description;
  if (competitionData.date) updateData.date = competitionData.date;
  if (competitionData.time) updateData.time = competitionData.time;
  if (competitionData.duration !== undefined) updateData.duration = competitionData.duration;
  if (competitionData.maxParticipants !== undefined) {
    updateData.max_participants = competitionData.maxParticipants;
  }
  if (competitionData.status) updateData.status = competitionData.status;
  if (competitionData.gatedCourseId !== undefined) updateData.gated_course_id = competitionData.gatedCourseId;
  if (competitionData.isPublished !== undefined) updateData.is_published = competitionData.isPublished;
  if (competitionData.isFinished !== undefined) updateData.is_finished = competitionData.isFinished;

  const { data, error } = await supabase
    .from('competitions')
    .update(updateData)
    .eq('id', competitionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating competition:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteCompetition(competitionId: string) {
  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', competitionId);

  if (error) {
    console.error('Error deleting competition:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function registerForCompetition(
  competitionId: string,
  studentId: string
) {
  const { data: existing } = await supabase
    .from('competition_participants')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('student_id', studentId)
    .single();

  if (existing) {
    return { success: false, error: 'Already registered for this competition' };
  }

  const { data: competition } = await supabase
    .from('competitions')
    .select('max_participants, registered_count')
    .eq('id', competitionId)
    .single();

  if (competition && competition.registered_count >= competition.max_participants) {
    return { success: false, error: 'Competition is full' };
  }

  const { data, error } = await supabase
    .from('competition_participants')
    .insert({
      competition_id: competitionId,
      student_id: studentId,
      status: 'registered'
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering for competition:', error);
    return { success: false, error: error.message };
  }

  await supabase
    .from('competitions')
    .update({ 
      registered_count: (competition?.registered_count || 0) + 1 
    })
    .eq('id', competitionId);

  return { success: true, data };
}

export async function unregisterFromCompetition(
  competitionId: string,
  studentId: string
) {
  const { error } = await supabase
    .from('competition_participants')
    .delete()
    .eq('competition_id', competitionId)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error unregistering from competition:', error);
    return { success: false, error: error.message };
  }

  const { data: competition } = await supabase
    .from('competitions')
    .select('registered_count')
    .eq('id', competitionId)
    .single();

  if (competition) {
    await supabase
      .from('competitions')
      .update({ 
        registered_count: Math.max(0, (competition.registered_count || 0) - 1) 
      })
      .eq('id', competitionId);
  }

  return { success: true };
}

export async function getStudentCompetitions(studentId: string) {
  const { data, error } = await supabase
    .from('competition_participants')
    .select(`
      *,
      competition:competitions(*)
    `)
    .eq('student_id', studentId)
    .order('registered_at', { ascending: false });

  if (error) {
    console.error('Error fetching student competitions:', error);
    return [];
  }

  return data || [];
}

export async function updateParticipantScore(
  participantId: string,
  score: number,
  rank?: number
) {
  const updateData: any = { score };
  if (rank !== undefined) updateData.rank = rank;

  const { error } = await supabase
    .from('competition_participants')
    .update(updateData)
    .eq('id', participantId);

  if (error) {
    console.error('Error updating participant score:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Student competition exam functions
export async function startStudentCompetition(competitionId: string, studentId: string) {
  // Check if already started
  const { data: existing } = await supabase
    .from('student_competitions')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    return { success: true, data: existing };
  }

  const { data, error } = await supabase
    .from('student_competitions')
    .insert({
      student_id: studentId,
      competition_id: competitionId,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting competition:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function submitStudentCompetition(
  competitionId: string,
  studentId: string,
  score: number,
  status: string = 'submitted'
) {
  const { error } = await supabase
    .from('student_competitions')
    .update({
      end_time: new Date().toISOString(),
      status,
      score,
    })
    .eq('competition_id', competitionId)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error submitting competition:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getCompetitionResults(competitionId: string) {
  const { data, error } = await supabase
    .from('student_competitions')
    .select(`
      *,
      student:students(id, full_name, phone_number)
    `)
    .eq('competition_id', competitionId)
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching competition results:', error);
    return [];
  }

  return data || [];
}

export async function getStudentCompetitionEntry(competitionId: string, studentId: string) {
  const { data } = await supabase
    .from('student_competitions')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('student_id', studentId)
    .maybeSingle();

  return data;
}
