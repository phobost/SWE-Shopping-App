import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { setDiscount } from "@/helpers/discount/util";
import { toast } from "sonner";

export const DiscountDrawer = ({
  buttonText = "Create Discount",
  title = "Create Discount",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [percentage, setPercentage] = React.useState(0);

  function onClick(adjustment: number) {
    setPercentage(clampPercentage(percentage + adjustment));
  }
  function clampPercentage(percentage: number) {
    return Math.min(Math.max(percentage, 0), 100);
  }

  return (
    <Drawer open={isOpen} modal={false}>
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto min-w-80 max-w-100 items-center justify-center pb-0">
          <DrawerHeader>
            <DrawerTitle className="text-4xl">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="items-center justify-center space-x-2">
              <div className="">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="Code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.trim());
                  }}
                />
              </div>

              <div className="flex space-x-2 justify-center items-center">
                <div className="flex text-7xl tracking-tighter">
                  <div className="font-bold">{percentage}</div>
                  <div className="text-muted-foreground">%</div>
                </div>
              </div>
              <div className="min-w-80 space-x-4 flex">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => onClick(-1)}
                >
                  <Minus />
                  <span className="sr-only">Decrease</span>
                </Button>
                <Slider
                  defaultValue={[percentage]}
                  dir="ltr"
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setPercentage(value[0]);
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => onClick(1)}
                >
                  <Plus />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={async () => {
                const newCode = code.trim();

                if (newCode == "") {
                  toast.error("Code cannot be emptry");
                  return;
                }
                if (newCode.match(/^[A-z0-9]{1,}$/) == null) {
                  toast.error(
                    "Code cannot contain any whitespace and must consist of only alphanumeric characters!",
                  );
                  return;
                }
                setIsOpen(false);
                await setDiscount({
                  id: code,
                  percentage,
                });
                toast.success(
                  `Created discount code "${code}" with discount of ${percentage}% off`,
                );
                setPercentage(0);
                setCode("");
              }}
            >
              Submit
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
