import pstats
import os
# Load the profile data 
# get all files in ../input/ directory
# merge them into a single object
stats = []
# chmod to the directory of the file
os.chdir(os.path.dirname(os.path.abspath(__file__)))
for file in os.listdir('../input/'):
    if file.endswith('.prof'):
        stats.append(pstats.Stats('../input/' + file))  

# Merge the stats
merged_stats = stats[0]
for stat in stats[1:]:
    merged_stats.add(stat)



# Optionally sort and print the combined stats
merged_stats.sort_stats('cumulative').print_stats()

# Save the merged profile data to a new file
merged_stats.dump_stats('../out/merged.prof')
# delete the input files
for file in os.listdir('../input/'):
    if file.endswith('.prof'):
        os.remove('../input/' + file)