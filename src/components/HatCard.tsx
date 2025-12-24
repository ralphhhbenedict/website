import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, LucideIcon } from "lucide-react";
import { trackPortfolioItemSelected } from "@/lib/mixpanel";
import { PortfolioPreviewModal, PortfolioItem } from "./PortfolioPreviewModal";

export interface HatCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  deliverables: string[];
  marketRate: string;
  portfolioItems?: PortfolioItem[];
}

export const HatCard = ({
  title,
  subtitle,
  icon: Icon,
  color = "primary",
  deliverables,
  marketRate,
  portfolioItems,
}: HatCardProps) => {
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = () => {
    if (selectedPortfolioIndex && portfolioItems) {
      setPreviewOpen(true);
    }
  };

  const selectedItem = selectedPortfolioIndex && portfolioItems
    ? portfolioItems[parseInt(selectedPortfolioIndex)]
    : null;

  return (
    <>
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-5 h-5 text-${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          <ul className="mt-3 space-y-1.5">
            {deliverables.map((item, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-1">*</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Market rate:</span>
              <Badge variant="outline" className="font-semibold">
                {marketRate}
              </Badge>
            </div>

            {portfolioItems && portfolioItems.length > 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <Select
                  value={selectedPortfolioIndex || ""}
                  onValueChange={(value) => {
                    setSelectedPortfolioIndex(value);
                    if (portfolioItems && value) {
                      trackPortfolioItemSelected(
                        title,
                        portfolioItems[parseInt(value)].label
                      );
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select portfolio item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolioItems.map((item, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={selectedPortfolioIndex ? "default" : "ghost"}
                  className={
                    selectedPortfolioIndex
                      ? "shrink-0 h-8 px-3"
                      : "text-muted-foreground shrink-0 h-8 px-3"
                  }
                  onClick={openPreview}
                  disabled={!selectedPortfolioIndex}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {selectedPortfolioIndex ? "View" : "Choose One"}
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-xs font-medium text-amber-500">
                Portfolio Coming Soon
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <PortfolioPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        portfolioItem={selectedItem}
        hatTitle={title}
      />
    </>
  );
};

export default HatCard;
