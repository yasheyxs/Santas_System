import { KPICard } from "@/components/KPICard";
import { DollarSign, Users, Calendar, TrendingUp, Activity, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const salesData = [
  { name: "Lun", ventas: 4500 },
  { name: "Mar", ventas: 5200 },
  { name: "Mié", ventas: 6800 },
  { name: "Jue", ventas: 7200 },
  { name: "Vie", ventas: 12500 },
  { name: "Sáb", ventas: 18900 },
  { name: "Dom", ventas: 15300 },
];

const attendanceData = [
  { name: "Lun", asistencia: 120 },
  { name: "Mar", asistencia: 140 },
  { name: "Mié", asistencia: 180 },
  { name: "Jue", asistencia: 220 },
  { name: "Vie", asistencia: 380 },
  { name: "Sáb", asistencia: 520 },
  { name: "Dom", asistencia: 450 },
];

const categoryData = [
  { name: "Bebidas", value: 45, color: "#6C63FF" },
  { name: "Entradas", value: 30, color: "#FF00FF" },
  { name: "VIP", value: 15, color: "#00FFD1" },
  { name: "Otros", value: 10, color: "#FFD600" },
];

const recentActivity = [
  { id: 1, type: "Venta", description: "Mesa VIP #5 - $2,450", time: "Hace 5 min", color: "text-green-400" },
  { id: 2, type: "Reserva", description: "Evento Viernes - 15 personas", time: "Hace 12 min", color: "text-primary" },
  { id: 3, type: "Ingreso", description: "Stock de bebidas actualizado", time: "Hace 30 min", color: "text-accent" },
  { id: 4, type: "Alerta", description: "Stock bajo: Vodka Premium", time: "Hace 1 hora", color: "text-destructive" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ventas Hoy"
          value="$18,900"
          icon={DollarSign}
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <KPICard
          title="Clientes Activos"
          value="520"
          icon={Users}
          trend={{ value: "+8.2%", isPositive: true }}
        />
        <KPICard
          title="Eventos Este Mes"
          value="12"
          icon={Calendar}
          trend={{ value: "+3", isPositive: true }}
        />
        <KPICard
          title="Productos Vendidos"
          value="1,245"
          icon={TrendingUp}
          trend={{ value: "+15.3%", isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Ventas de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(245 15% 18%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 65%)" />
                <YAxis stroke="hsl(0 0% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(245 15% 13%)", 
                    border: "1px solid hsl(245 15% 18%)",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="ventas" fill="hsl(245 100% 69%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Asistencia Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(245 15% 18%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 65%)" />
                <YAxis stroke="hsl(0 0% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(245 15% 13%)", 
                    border: "1px solid hsl(245 15% 18%)",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="asistencia" 
                  stroke="hsl(300 100% 50%)" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(300 100% 50%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Ventas por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(245 15% 13%)", 
                    border: "1px solid hsl(245 15% 18%)",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
