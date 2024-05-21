# delete unused items from mendix application

This a new-build tool works for [Mendix](https://www.mendix.com/) projects , the tool delete all not used elements from mendix project.

for more details about how to implement this in your project please refer to this post [click here for more details](https://www.linkedin.com/posts/sharad-suryavanshi-779210119_hello-connections-ive-been-very-curious-activity-7195462596399927296-KKgf?utm_source=share&utm_medium=member_desktop)

my humble contribution was in making code works across all project modules and looking for the desired element
(ex: microflow) whether it was used in any module or not and taking in consideration the best possible way for searching modules for this element (ex: microflow).

## limitations

for large complected projects this tool might not works perfectly due to its algorithm since its allocates so much space from RAM
because it traverse each and every modulelooking in all its elements (ex: pages , microflows , nanoflows)
and takes long time to process , this is might be an area for next development.

#### Thank you [Sharad Suryavanshi](https://www.linkedin.com/in/sharad-suryavanshi-779210119/) for building this code