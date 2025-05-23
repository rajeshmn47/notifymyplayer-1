import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "./ui/switch"
import { cn } from "@/lib/utils"
import { useState } from "react"
import FilterPopover from "./ui/FilterPopOver"

function Filters({ values, onChange, clips }) {
  const [open, setOpen] = React.useState(false);
  const [openMap, setOpenMap] = useState({});

  const togglePopover = (key, value) => {
    console.log(key, value, 'toggling')
    setOpenMap((prev) => ({ ...prev, [key]: !value }));
  };


  const uniqueBatsmen = Array.from(
    new Set(clips.map((clip) => clip.batsman))
  ).map((name) => ({
    id: name?.toLowerCase(),
    name,
  }));

  const uniqueBowler = Array.from(
    new Set(clips.map((clip) => clip.bowler))
  ).map((name) => ({
    id: name?.toLowerCase(),
    name,
  }));

  const shotTypes = [
    { id: "cover_drive", name: "Cover Drive" },
    { id: "straight_drive", name: "Straight Drive" },
    { id: "on_drive", name: "On Drive" },
    { id: "off_drive", name: "Off Drive" },
    { id: "square_drive", name: "Square Drive" },
    { id: "pull", name: "Pull" },
    { id: "hook", name: "Hook" },
    { id: "cut", name: "Cut" },
    { id: "upper_cut", name: "Upper Cut" },
    { id: "sweep", name: "Sweep" },
    { id: "reverse_sweep", name: "Reverse Sweep" },
    { id: "paddle_sweep", name: "Paddle Sweep" },
    { id: "switch_hit", name: "Switch Hit" },
    { id: "lofted_shot", name: "Lofted Shot" },
    { id: "helicopter_shot", name: "Helicopter Shot" },
    { id: "glance", name: "Glance" },
    { id: "flick", name: "Flick" },
    { id: "dab", name: "Dab" },
    { id: "defensive_shot", name: "Defensive Shot" },
    { id: "reverse_hit", name: "Reverse Hit" },
    { id: "scoop", name: "Scoop" },
    { id: "ramp_shot", name: "Ramp Shot" },
    { id: "uppercut", name: "Uppercut" }
  ]

  const filterConfig = [
    { type: "searchable", label: "Batsman", key: "batsman", options: uniqueBatsmen },
    { type: "searchable", label: "Bowler", key: "bowler", options: uniqueBowler },
    { type: "searchable", label: "Team", key: "team", options: [{ id: "rcb", name: "RCB" }, { id: "csk", name: "CSK" }] },
    { type: "select", label: "League", key: "league", options: [{ id: "ipl", name: "IPL" }, { id: "bbl", name: "BBL" }] },
    { type: "select", label: "Shot Type", key: "shotType", options: shotTypes },
    { type: "select", label: "Bowler Type", key: "bowlerType", options: [{ id: "pace", name: "Pace" }, { id: "spin", name: "Spin" }] },
    { type: "select", label: "Batting Hand", key: "battingHand", options: [{ id: "left", name: "Left" }, { id: "right", name: "Right" }] },
    { type: "select", label: "Bowling Hand", key: "bowlingHand", options: [{ id: "left", name: "Left" }, { id: "right", name: "Right" }] },
    { type: "select", label: "Match Format", key: "matchFormat", options: [{ id: "odi", name: "ODI" }, { id: "t20", name: "T20" }, { id: "test", name: "Test" }] },
    { type: "select", label: "Match Venue", key: "venue", options: [{ id: "wankhede", name: "Wankhede" }, { id: "chinnaswamy", name: "Chinnaswamy" }] },
    { type: "select", label: "Season", key: "season", options: [{ id: "2024", name: "2024" }, { id: "2023", name: "2023" }] },
    { type: "select", label: "Over Range", key: "overRange", options: [{ id: "1-6", name: "1-6" }, { id: "7-15", name: "7-15" }, { id: "16-20", name: "16-20" }] },
    { type: "boolean", label: "Is Boundary", key: "isBoundary" },
    { type: "boolean", label: "Is Six", key: "isSix" },
    { type: "boolean", label: "Is Four", key: "isFour" },
    { type: "boolean", label: "Is Wicket", key: "isWicket" },
    { type: "boolean", label: "Is Catch", key: "isCatch" },
    { type: "boolean", label: "Is Runout", key: "isRunout" },
    { type: "boolean", label: "Is LBW", key: "isLBW" },
    { type: "boolean", label: "Is Clean Bowled", key: "isCleanBowled" },
    { type: "boolean", label: "Is Stumping", key: "isStumping" },
    {
      type: "select", label: "Duration (sec)", key: "durationRange", options: [
        { id: "0-2", name: "0-2 sec" },
        { id: "2-5", name: "2-5 sec" },
        { id: "5-10", name: "5-10 sec" },
        { id: "10+", name: "10+ sec" },
      ],
    }

  ]

  console.log(openMap, "openMap")

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-muted rounded-md">
      {filterConfig.map((filter) => {
        if (filter.type === "select") {
          return (
            <div key={filter.key}>
              <Label className="mb-1 block">{filter.label}</Label>
              <Select
                value={values[filter.key] || ""}
                onValueChange={(value) => onChange(filter.key, value === "clear" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter.label}`} className="cursor-pointer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear" className="text-gray-500 italic">
                    Select Option
                  </SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }

        if (filter.type === "searchable") {
          const selected = filter.options.find(o => o.id === values[filter.key])
          return (
            <FilterPopover onChange={onChange} filter={filter} selected={selected} />
          )
        }
        {/*const selected = filter.options.find(o => o.id === values[filter.key])
          return (
            <div key={filter.key}>
              <Label className="mb-1 block">{filter.label}</Label>
              <Popover open={openMap[filter.key] || false} onOpenChange={(val) => togglePopover(filter.key, openMap[filter.key])}>
                <PopoverTrigger asChild>
                  <div className="border rounded px-3 py-2 text-sm bg-white cursor-pointer flex justify-between" onClick={() => setOpen(!open)}>
                    {selected?.name ? selected.name : `Select ${filter.label}`}
                    {selected?.name && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onChange(filter.key, null) // Clear the selection
                        }}
                        className="ml-2 text-gray-500 hover:text-black cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px] bg-white">
                  <Command>
                    <CommandInput placeholder={`Search ${filter.label}...`} />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      {filter.options.map((opt) => (
                        <CommandItem
                          key={opt.id}
                          onSelect={() => onChange(filter.key, opt.id)}
                        >
                          {opt.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )
        }*/}

        if (filter.type === "boolean") {
          return (
            <div key={filter.key} className="flex items-center space-x-3">
              <Switch
                id={filter.key}
                className="cursor-pointer"
                checked={values[filter.key] || false}
                onCheckedChange={(value) => onChange(filter.key, value)}

              />
              <Label htmlFor={filter.key}>{filter.label}</Label>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export default Filters
