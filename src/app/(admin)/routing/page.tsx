import UpgradeView from "@/components/admin/UpgradeView";

export default function RoutingPage() {
  return (
    <div>
      <UpgradeView 
        featureTitle="Route bookings to the right team member automatically" 
        featureDesc="Use routing rules to qualify bookers and assign meetings to the best team member." 
      />
    </div>
  );
}
