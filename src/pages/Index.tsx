import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type EventCategory = 'work' | 'personal' | 'meeting' | 'deadline';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  description?: string;
}

const categoryConfig = {
  work: { label: 'Работа', icon: 'Briefcase', color: 'bg-event-work' },
  personal: { label: 'Личное', icon: 'Heart', color: 'bg-event-personal' },
  meeting: { label: 'Встреча', icon: 'Users', color: 'bg-event-meeting' },
  deadline: { label: 'Дедлайн', icon: 'AlertCircle', color: 'bg-event-deadline' },
};

export default function Index() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Планирование проекта',
      date: '2024-11-15',
      time: '10:00',
      category: 'work',
      description: 'Обсуждение новых фич'
    },
    {
      id: '2',
      title: 'Встреча с клиентом',
      date: '2024-11-16',
      time: '14:00',
      category: 'meeting',
    },
    {
      id: '3',
      title: 'Сдача отчета',
      date: '2024-11-18',
      time: '17:00',
      category: 'deadline',
    }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    category: 'work',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const upcoming = events.filter(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const timeDiff = eventDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff > 0 && hoursDiff <= 24;
      });

      upcoming.forEach(event => {
        toast({
          title: '🔔 Предстоящее событие',
          description: `${event.title} - ${event.time}`,
        });
      });
    };

    const interval = setInterval(checkUpcomingEvents, 60000);
    checkUpcomingEvents();
    
    return () => clearInterval(interval);
  }, [events, toast]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title!,
      date: newEvent.date!,
      time: newEvent.time!,
      category: newEvent.category as EventCategory,
      description: newEvent.description
    };

    setEvents([...events, event]);
    setIsAddDialogOpen(false);
    setNewEvent({ title: '', date: '', time: '', category: 'work', description: '' });
    
    toast({
      title: '✅ Событие добавлено',
      description: `${event.title} создано успешно`,
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-pink-50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Календарь Событий
            </h1>
            <p className="text-muted-foreground text-lg">
              Управляйте вашими событиями и получайте уведомления
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-2 animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Icon name="Calendar" size={28} className="text-primary" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                        className="hover:scale-110 transition-transform"
                      >
                        <Icon name="ChevronLeft" size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                        className="hover:scale-110 transition-transform"
                      >
                        <Icon name="ChevronRight" size={20} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                    
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const dayEvents = getEventsForDate(day);
                      const isToday = day === new Date().getDate() && 
                                     currentDate.getMonth() === new Date().getMonth() &&
                                     currentDate.getFullYear() === new Date().getFullYear();
                      
                      return (
                        <div
                          key={day}
                          className={`aspect-square p-2 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-lg ${
                            isToday 
                              ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border-primary' 
                              : 'bg-card/50 border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-semibold mb-1">{day}</div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`w-full h-1.5 rounded-full ${categoryConfig[event.category].color}`}
                              />
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{dayEvents.length - 2}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const count = events.filter(e => e.category === key).length;
                  return (
                    <Card key={key} className="backdrop-blur-sm bg-card/80 hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color} text-white`}>
                          <Icon name={config.icon} size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{config.label}</div>
                          <div className="text-2xl font-bold">{count}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-14 text-lg font-semibold shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Plus" size={24} className="mr-2" />
                    Добавить событие
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Новое событие</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Название события"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Дата</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Время</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Категория</Label>
                      <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value as EventCategory })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon name={config.icon} size={16} />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Input
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Дополнительная информация"
                      />
                    </div>
                    <Button onClick={handleAddEvent} className="w-full">
                      Создать событие
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Card className="backdrop-blur-sm bg-card/80 shadow-xl animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ListTodo" size={24} className="text-primary" />
                    Ближайшие события
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {events
                    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                    .slice(0, 10)
                    .map((event) => {
                      const config = categoryConfig[event.category];
                      return (
                        <div
                          key={event.id}
                          className="p-4 rounded-xl border-2 bg-card hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.color} text-white shrink-0`}>
                              <Icon name={config.icon} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm mb-1 truncate">{event.title}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon name="Calendar" size={12} />
                                {new Date(event.date).toLocaleDateString('ru-RU')}
                                <Icon name="Clock" size={12} className="ml-2" />
                                {event.time}
                              </div>
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="CalendarX" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет запланированных событий</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
