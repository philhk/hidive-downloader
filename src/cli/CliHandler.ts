import inquirer, { AllChoiceMap, Answers, AsyncDynamicQuestionProperty, DistinctChoice } from 'inquirer'
import { Resolution, RESTApiEpisode, RESTApiMediaSource, RESTApiTitle } from '../api/HidiveDao'
import { ApiKey } from '../models/ApiKey'
import { User } from '../models/User'

export class CliHandler {
    public async promptConcurrentDownloads(): Promise<number> {
        return (await inquirer.prompt({
            type: 'number',
            message: 'How many simultaneous downloads would you like to have?',
            default: 1,
            name: 'concurrent'
        })).concurrent
    }

    public async promptActions(actions: { message: string, value: string }[]): Promise<string> {
        return this.promptList('What do you want to do?',
            actions.map(action => {
                return {
                    name: action.message,
                    value: action.value
                }
            })
        )
    }

    public async promptEpisodesList(episodes: RESTApiEpisode[]): Promise<RESTApiEpisode[]> {
        return this.promptCheckbox('Which episodes would you like to download?',
            episodes.map(episode => {
                return {
                    name: ` E${episode.EpisodeNumberValue} | ${episode.Name}`,
                    value: episode
                }
            })
        )
    }

    public async promptSeriesList(titles: RESTApiTitle[]): Promise<RESTApiTitle> {
        return this.promptList('Which series would you like to download?',
            titles.map(series => {
                return {
                    name: series.Name,
                    value: series
                }
            })
        )
    }

    public async promptUserList(users: User[]): Promise<User> {
        return this.promptList('Please select your desired account',
            users.map(user => {
                return {
                    name: user.email,
                    value: user
                }
            })
        )
    }

    public async promptApiKey(apiKeys: ApiKey[]): Promise<ApiKey> {
        return this.promptList('Please select your desired API key',
            apiKeys.map(apiKey => {
                return {
                    name: apiKey.key,
                    value: apiKey
                }
            })
        )
    }

    public async promptGetApiKey(): Promise<Omit<ApiKey, 'id'>> {
        const { key } = await inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter an API key',
                name: 'key'
            }
        ])

        return { key }
    }

    public async promptGetAuth(): Promise<Omit<User, 'id'>> {
        const { email, password } = await inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter your E-Mail',
                name: 'email'
            },
            {
                type: 'input',
                message: 'Please enter your password',
                name: 'password'
            },
        ])

        return { email, password }
    }

    public async promptResolutionFromMedia(medias: RESTApiMediaSource[]) {
        return this.promptList<Resolution>('Which resolution would you like to have? (Unavailable resolutions will fall back to the best)',
            medias.map(media => {
                return {
                    name: `${media.RESOLUTION.width}x${media.RESOLUTION.height} (${media.BANDWIDTH / 1000} kB/s)`,
                    value: media.RESOLUTION
                }
            })
        )
    }

    public async promptVideoLanguage(languages: string[]) {
        return this.promptList<string>('Which video language would you like to have? (Unavailable languages will fall back to Japanese)',
            languages.map(language => {
                return {
                    name: language
                }
            })
        )
    }

    public async promptList<T>(message: string, choices: AsyncDynamicQuestionProperty<ReadonlyArray<DistinctChoice<Answers, AllChoiceMap<Answers>>>, Answers> | undefined): Promise<T> {
        return (await inquirer.prompt({
            type: 'list',
            message,
            name: 'item',
            choices: choices
        },
            { clearPromptOnDone: true })).item
    }

    public async promptCheckbox<T>(message: string, choices: AsyncDynamicQuestionProperty<ReadonlyArray<DistinctChoice<Answers, AllChoiceMap<Answers>>>, Answers> | undefined): Promise<T> {
        return (await inquirer.prompt({
            type: 'checkbox',
            message,
            name: 'item',
            choices: choices
        })).item
    }

    public async promptInput(message: string): Promise<string> {
        return (await inquirer.prompt({
            type: 'input',
            message,
            name: 'input'
        })).input
    }

    public async promptConfirm(message: string): Promise<boolean> {
        return (await inquirer.prompt({
            type: 'list',
            message,
            name: 'confirmed',
            choices: [
                {
                    name: 'Yes',
                    value: true
                },
                {
                    name: 'No',
                    value: false,
                    checked: true
                }
            ]
        })).confirmed
    }
}