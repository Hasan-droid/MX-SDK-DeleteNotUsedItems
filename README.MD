# delete unused items from mendix application

This a new-build tool works for [Mendix](https://www.mendix.com/) projects , the tool delete not used elements(Pages , Microflows , Nanoflows) from mendix project.

for more details about how to implement this in your project please refer to this post [click here for more details](https://www.linkedin.com/posts/sharad-suryavanshi-779210119_hello-connections-ive-been-very-curious-activity-7195462596399927296-KKgf?utm_source=share&utm_medium=member_desktop)

my humble contribution was in making code works across all project modules and looking for the desired element
(ex: microflow) whether it was used in any module or not and taking in consideration the best possible way for searching modules for this element (ex: microflow).

## limitations

for large complected projects this tool might not works perfectly due to its algorithm since its allocates so much space from RAM
because it traverse each and every module looking in all its elements (ex: pages , microflows , nanoflows)
and takes long time to process , this is might be an area for next development.

## Installation

1. clone the project.
2. run script **npm i** in the project root.
3. add **.env**.
4. add variable name **MENDIX_APP_ID** and then assign the mendix project ID to it.
5. run script **npm run start**.

## Contributing

We welcome contributions! To ensure the quality of our code, please follow these steps:

1. Fork the repository.
2. Create a new branch from `main` for your feature or bugfix.
3. Commit your changes to your branch.
4. Open a pull request to the `main` branch.
5. One of the maintainers will review your changes and merge them if everything is fine.

Thank you for contributing!

#### Thank you [Sharad Suryavanshi](https://www.linkedin.com/in/sharad-suryavanshi-779210119/) for building this code
