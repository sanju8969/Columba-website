import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, FileText, Calendar, ClipboardList } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'faculty' | 'student';
  avatar_url?: string;
  phone?: string;
}

interface FacultyDashboardProps {
  profile: Profile;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ profile }) => {
  const [stats, setStats] = useState({
    myCourses: 0,
    myStudents: 0,
    pendingGrades: 0,
    myNotices: 0
  });

  const [facultyInfo, setFacultyInfo] = useState<any>(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        // Fetch faculty profile
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*, departments(*)')
          .eq('id', profile.id)
          .single();

        setFacultyInfo(facultyData);

        // Fetch statistics
        const [coursesRes, enrollmentsRes, noticesRes] = await Promise.all([
          supabase.from('enrollments').select('course_id', { count: 'exact', head: true }).eq('faculty_id', profile.id),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('faculty_id', profile.id),
          supabase.from('notices').select('*', { count: 'exact', head: true }).eq('author_id', profile.id)
        ]);

        // Get unique courses
        const { data: uniqueCourses } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('faculty_id', profile.id);

        const uniqueCourseIds = [...new Set(uniqueCourses?.map(e => e.course_id))];

        setStats({
          myCourses: uniqueCourseIds.length,
          myStudents: enrollmentsRes.count || 0,
          pendingGrades: 0, // Would need to calculate based on assignments without grades
          myNotices: noticesRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      }
    };

    fetchFacultyData();
  }, [profile.id]);

  const statCards = [
    {
      title: 'My Courses',
      value: stats.myCourses,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'My Students',
      value: stats.myStudents,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Pending Grades',
      value: stats.pendingGrades,
      icon: ClipboardList,
      color: 'text-orange-600'
    },
    {
      title: 'My Notices',
      value: stats.myNotices,
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Faculty Dashboard</h2>
          {facultyInfo && (
            <p className="text-muted-foreground">
              {facultyInfo.designation} - {facultyInfo.departments?.name}
            </p>
          )}
        </div>
        <Badge variant="secondary">Faculty</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Faculty Profile Card */}
      {facultyInfo && (
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                <p className="text-sm">{facultyInfo.employee_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm">{facultyInfo.departments?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Designation</p>
                <p className="text-sm">{facultyInfo.designation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                <p className="text-sm">{facultyInfo.experience_years} years</p>
              </div>
              {facultyInfo.qualification && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                  <p className="text-sm">{facultyInfo.qualification}</p>
                </div>
              )}
              {facultyInfo.specialization && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                  <p className="text-sm">{facultyInfo.specialization}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => alert('My Courses functionality coming soon!')}
            >
              <BookOpen className="h-6 w-6" />
              <span>My Courses</span>
            </Button>
            <Button 
              className="h-auto p-4 flex flex-col items-center space-y-2" 
              variant="outline"
              onClick={() => alert('Student List functionality coming soon!')}
            >
              <GraduationCap className="h-6 w-6" />
              <span>Student List</span>
            </Button>
            <Button 
              className="h-auto p-4 flex flex-col items-center space-y-2" 
              variant="outline"
              onClick={() => alert('Grade Students functionality coming soon!')}
            >
              <ClipboardList className="h-6 w-6" />
              <span>Grade Students</span>
            </Button>
            <Button 
              className="h-auto p-4 flex flex-col items-center space-y-2" 
              variant="outline"
              onClick={() => alert('Create Notice functionality coming soon!')}
            >
              <FileText className="h-6 w-6" />
              <span>Create Notice</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Graded Assignment 3 for CS101</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Published new course material</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Updated course syllabus</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboard;