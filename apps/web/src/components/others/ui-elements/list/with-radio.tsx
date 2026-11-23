"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const radioItems = [
  { id: "option1", value: "option1", label: "Lorem ipsum dolor sit amet" },
  {
    id: "option2",
    value: "option2",
    label: "It is a long established fact reader",
  },
  { id: "option3", value: "option3", label: "Lorem ipsum dolor sit amet" },
  { id: "option4", value: "option4", label: "Lorem ipsum dolor sit amet" },
  { id: "option5", value: "option5", label: "Lorem ipsum dolor sit amet" },
];

export default function ListWithRadio() {
  const [selectedValue, setSelectedValue] = useState<string>("option1");

  const handleChange = (value: string) => {
    setSelectedValue(value);
    console.log("Selected Value:", value);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white sm:w-fit dark:border-gray-800 dark:bg-white/3">
      <RadioGroup
        name="example"
        value={selectedValue}
        onValueChange={handleChange}
        className="gap-0"
      >
        <ul className="flex flex-col">
          {radioItems.map((item) => (
            <li
              key={item.id}
              className="border-b border-gray-200 px-3 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <Field orientation="horizontal">
                <RadioGroupItem id={item.id} value={item.value} />
                <Label
                  htmlFor={item.id}
                  className="cursor-pointer font-normal text-gray-500 dark:text-gray-400"
                >
                  {item.label}
                </Label>
              </Field>
            </li>
          ))}
        </ul>
      </RadioGroup>
    </div>
  );
}

