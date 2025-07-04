import { useState, useEffect } from 'react';
import { useAdmin, Promotion } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PromotionsManager = () => {
  const { fetchPromotions, createPromotion, updatePromotion, deletePromotion } = useAdmin();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    active: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const promotionData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, promotionData);
      } else {
        await createPromotion(promotionData);
      }

      setIsDialogOpen(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Failed to save promotion');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      image_url: promotion.image_url || '',
      link_url: promotion.link_url || '',
      active: promotion.active,
      start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '',
      end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      await deletePromotion(id);
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      await updatePromotion(promotion.id, { active: !promotion.active });
      loadPromotions();
    } catch (error) {
      console.error('Error updating promotion status:', error);
      toast.error('Failed to update promotion status');
    }
  };

  const resetForm = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      active: true,
      start_date: '',
      end_date: '',
    });
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.active) return false;
    
    const now = new Date();
    const startDate = promotion.start_date ? new Date(promotion.start_date) : null;
    const endDate = promotion.end_date ? new Date(promotion.end_date) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  if (loading) {
    return <div className="text-center py-8">Loading promotions...</div>;
  }

  const activePromotions = promotions.filter(p => isPromotionActive(p));
  const inactivePromotions = promotions.filter(p => !isPromotionActive(p));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Promotional Content ({promotions.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion ? 'Update promotional content' : 'Create a new promotional banner or campaign'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePromotions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{inactivePromotions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {promotion.image_url && (
                      <img
                        src={promotion.image_url}
                        alt={promotion.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{promotion.title}</div>
                      {promotion.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {promotion.description}
                        </div>
                      )}
                      {promotion.link_url && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-xs">{promotion.link_url}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isPromotionActive(promotion) ? "default" : "secondary"}>
                      {isPromotionActive(promotion) ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={promotion.active}
                      onCheckedChange={() => toggleActive(promotion)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {promotion.start_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>From: {new Date(promotion.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {promotion.end_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>To: {new Date(promotion.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {!promotion.start_date && !promotion.end_date && (
                      <span className="text-muted-foreground">No schedule</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(promotion.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No promotions found. Create your first promotional campaign to get started.
        </div>
      )}
    </div>
  );
};

export default PromotionsManager;