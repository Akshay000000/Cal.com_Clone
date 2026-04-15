"use client";
import EventTypeForm from "@/components/admin/EventTypeForm";

export default function EditEventTypePage({ params }: { params: { id: string } }) {
  return <EventTypeForm eventTypeId={parseInt(params.id)} />;
}
